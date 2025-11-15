import Groq from 'groq-sdk';

// Groq models - using llama-3.1-8b-instant as default (fast and reliable)
// Available models: llama-3.1-8b-instant, llama-3.1-70b-instant, mixtral-8x7b-32768, gemma-7b-it
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set. Please check your .env file.');
  }
  // Validate API key format
  if (apiKey.length < 20) {
    throw new Error('GROQ_API_KEY appears to be invalid (too short). Please check your .env file.');
  }
  return new Groq({ apiKey });
}

function assertClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set. Please check your .env file.');
  }
}

export async function generateSummary(text, { detail = 'medium' } = {}) {
  assertClient();
  const client = getClient();
  const prompt = `Summarize the following content at a ${detail} detail level. Keep it structured with headings and bullet points where helpful.\n\n${text}`;
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an academic study assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
    });
    // Groq SDK returns ChatCompletion directly with choices array
    return response?.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    // Parse error response
    let errorMessage = error?.message || String(error);
    let errorCode = error?.error?.code || error?.code;
    let statusCode = error?.status || error?.statusCode;
    
    // Try to parse if error message is a JSON string
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        errorCode = parsed.error.code;
        errorMessage = parsed.error.message;
      }
      statusCode = parsed.status || statusCode;
    } catch {
      // Not JSON, use as is
    }
    
    // Provide more helpful error messages
    if (statusCode === 401 || errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API key')) {
      throw new Error('Invalid Groq API key. Please check your API key at https://console.groq.com/keys and update your .env file.');
    }
    if (statusCode === 429 || errorMessage?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}

export async function generateFlashcards(text) {
  assertClient();
  const client = getClient();
  const prompt = `Create concise flashcards from the content. Return ONLY a valid JSON array with objects containing fields: question, answer, and tag. Do not include any markdown formatting, code blocks, or explanatory text. Example format:
[
  {"question": "What is X?", "answer": "X is...", "tag": "concept"},
  {"question": "What is Y?", "answer": "Y is...", "tag": "definition"}
]`;
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a JSON generator. You ONLY return valid JSON arrays, no other text, no markdown, no code blocks.' },
        { role: 'user', content: `${prompt}\n\nContent:\n${text.substring(0, 8000)}` }
      ],
      temperature: 0.3
    });
    const raw = response?.choices?.[0]?.message?.content || '[]';
    console.log('Raw AI response length:', raw.length);
    console.log('Raw AI response preview:', raw.substring(0, 200));
    
    // Try to extract JSON from markdown code blocks if present
    let jsonString = raw.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
      console.log('Extracted JSON from code block');
    }
    
    // Remove any leading/trailing non-JSON text
    const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonString = arrayMatch[0];
      console.log('Extracted JSON array from text');
    }
    
    try {
      const parsed = JSON.parse(jsonString);
      console.log('Parsed JSON type:', typeof parsed, 'Is array:', Array.isArray(parsed));
      
      // Handle case where response might be wrapped in an object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        console.log('Response is an object, looking for array...');
        // Try to find an array in the object
        const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
        if (arrayKey) {
          console.log('Found array in key:', arrayKey, 'Length:', parsed[arrayKey].length);
          return parsed[arrayKey];
        }
        // If it's an object with flashcards property
        if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          console.log('Found flashcards array, Length:', parsed.flashcards.length);
          return parsed.flashcards;
        }
        console.log('Object keys:', Object.keys(parsed));
      }
      const result = Array.isArray(parsed) ? parsed : [];
      console.log('Returning flashcards array, Length:', result.length);
      return result;
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Raw response (first 500 chars):', raw.substring(0, 500));
      console.error('JSON string attempted (first 500 chars):', jsonString.substring(0, 500));
      return [];
    }
  } catch (error) {
    console.error('Groq API error:', error);
    // Parse error response
    let errorMessage = error?.message || String(error);
    let errorCode = error?.error?.code || error?.code;
    let statusCode = error?.status || error?.statusCode;
    
    // Try to parse if error message is a JSON string
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        errorCode = parsed.error.code;
        errorMessage = parsed.error.message;
      }
      statusCode = parsed.status || statusCode;
    } catch {
      // Not JSON, use as is
    }
    
    // Provide more helpful error messages
    if (statusCode === 401 || errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API key')) {
      throw new Error('Invalid Groq API key. Please check your API key at https://console.groq.com/keys and update your .env file.');
    }
    if (statusCode === 429 || errorMessage?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}

export async function generateQuiz(text, { numQuestions = 10 } = {}) {
  assertClient();
  const client = getClient();
  const prompt = `Generate ${numQuestions} multiple choice questions (MCQs) from the following content. Return ONLY a valid JSON array with objects containing fields: question (string), options (array of exactly 4 strings), answer (integer index 0-3), explanation (string). Do not include any markdown formatting, code blocks, or explanatory text. Example format:
[
  {
    "question": "What is X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Explanation for why this is correct"
  }
]`;
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a JSON generator. You ONLY return valid JSON arrays, no other text, no markdown, no code blocks.' },
        { role: 'user', content: `${prompt}\n\nContent:\n${text.substring(0, 8000)}` }
      ],
      temperature: 0.4,
    });
    const raw = response?.choices?.[0]?.message?.content || '[]';
    console.log('Raw AI quiz response length:', raw.length);
    console.log('Raw AI quiz response preview:', raw.substring(0, 300));
    
    // Try to extract JSON from markdown code blocks if present
    let jsonString = raw.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
      console.log('Extracted JSON from code block');
    }
    
    // Remove any leading/trailing non-JSON text
    const arrayMatch = jsonString.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonString = arrayMatch[0];
      console.log('Extracted JSON array from text');
    }
    
    try {
      const parsed = JSON.parse(jsonString);
      console.log('Parsed JSON type:', typeof parsed, 'Is array:', Array.isArray(parsed));
      
      // Handle case where response might be wrapped in an object
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        console.log('Response is an object, looking for array...');
        // Try to find an array in the object
        const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
        if (arrayKey) {
          console.log('Found array in key:', arrayKey, 'Length:', parsed[arrayKey].length);
          return parsed[arrayKey];
        }
        // If it's an object with questions property
        if (parsed.questions && Array.isArray(parsed.questions)) {
          console.log('Found questions array, Length:', parsed.questions.length);
          return parsed.questions;
        }
        console.log('Object keys:', Object.keys(parsed));
      }
      const result = Array.isArray(parsed) ? parsed : [];
      console.log('Returning quiz array, Length:', result.length);
      return result;
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Raw response (first 500 chars):', raw.substring(0, 500));
      console.error('JSON string attempted (first 500 chars):', jsonString.substring(0, 500));
      return [];
    }
  } catch (error) {
    console.error('Groq API error:', error);
    // Parse error response
    let errorMessage = error?.message || String(error);
    let errorCode = error?.error?.code || error?.code;
    let statusCode = error?.status || error?.statusCode;
    
    // Try to parse if error message is a JSON string
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        errorCode = parsed.error.code;
        errorMessage = parsed.error.message;
      }
      statusCode = parsed.status || statusCode;
    } catch {
      // Not JSON, use as is
    }
    
    // Provide more helpful error messages
    if (statusCode === 401 || errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API key')) {
      throw new Error('Invalid Groq API key. Please check your API key at https://console.groq.com/keys and update your .env file.');
    }
    if (statusCode === 429 || errorMessage?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}

export async function solveTextWithAI(text) {
  assertClient();
  const client = getClient();
  const prompt = `Solve the following problem with step-by-step reasoning, then provide a final concise answer.\n\n${text}`;
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful tutor that explains step-by-step.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });
    return response?.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    // Parse error response
    let errorMessage = error?.message || String(error);
    let errorCode = error?.error?.code || error?.code;
    let statusCode = error?.status || error?.statusCode;
    
    // Try to parse if error message is a JSON string
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed.error) {
        errorCode = parsed.error.code;
        errorMessage = parsed.error.message;
      }
      statusCode = parsed.status || statusCode;
    } catch {
      // Not JSON, use as is
    }
    
    // Provide more helpful error messages
    if (statusCode === 401 || errorCode === 'invalid_api_key' || errorMessage?.includes('Invalid API key')) {
      throw new Error('Invalid Groq API key. Please check your API key at https://console.groq.com/keys and update your .env file.');
    }
    if (statusCode === 429 || errorMessage?.includes('rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}
