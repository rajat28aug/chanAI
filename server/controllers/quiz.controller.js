import { generateQuiz } from '../services/together.service.js';
import Quiz from '../models/Quiz.js';
import Document from '../models/Document.js';

export async function quizController(req, res) {
  try {
    const { text, numQuestions = 10 } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    const quiz = await generateQuiz(text, { numQuestions });
    
    // Convert quiz format: answer index -> correctAnswer string
    const formattedQuestions = quiz.map(q => ({
      question: q.question,
      options: q.options || [],
      correctAnswer: q.options?.[q.answer] || q.correctAnswer || q.options?.[0] || '',
      explanation: q.explanation || ''
    }));
    
    // Save quiz to database
    const savedQuiz = await Quiz.create({
      questions: formattedQuestions,
      sourceText: text,
      topic: 'Generated Quiz'
    });
    
    res.json({ quiz, id: savedQuiz._id });
  } catch (e) {
    console.error('Error generating quiz:', e);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

export async function getQuizzesController(req, res) {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(50);
    
    // Fetch document info for quizzes with documentId
    const documentIds = [...new Set(quizzes.filter(q => q.documentId).map(q => q.documentId))];
    const documents = await Document.find({ id: { $in: documentIds } });
    const documentMap = {};
    documents.forEach(doc => {
      documentMap[doc.id] = doc;
    });
    
    const formattedQuizzes = quizzes.map(quiz => {
      const doc = quiz.documentId ? documentMap[quiz.documentId] : null;
      
      // Format questions properly with answer index
      const formattedQuestions = (quiz.questions || []).map((q) => {
        const answerIndex = q.options?.indexOf(q.correctAnswer);
        return {
          question: q.question,
          options: q.options || [],
          answer: answerIndex >= 0 ? answerIndex : 0,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        };
      });
      
      return {
        id: quiz._id.toString(),
        title: quiz.topic || (doc ? `Quiz from ${doc.filename}` : 'Untitled Quiz'),
        subject: 'General',
        difficulty: 'Medium',
        questionCount: formattedQuestions.length,
        timeLimit: 15,
        description: doc 
          ? `Quiz generated from ${doc.filename}` 
          : `Quiz generated from ${quiz.sourceText?.substring(0, 50)}...` || 'Generated quiz',
        questions: formattedQuestions,
        documentId: quiz.documentId || null,
        documentName: doc ? doc.filename : null
      };
    });
    res.json({ quizzes: formattedQuizzes });
  } catch (e) {
    console.error('Error fetching quizzes:', e);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
}

export async function getQuizByIdController(req, res) {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Fetch document info if documentId exists
    let document = null;
    if (quiz.documentId) {
      document = await Document.findOne({ id: quiz.documentId });
    }
    
    const formattedQuiz = {
      id: quiz._id.toString(),
      title: quiz.topic || (document ? `Quiz from ${document.filename}` : 'Untitled Quiz'),
      subject: 'General',
      difficulty: 'Medium',
      questionCount: quiz.questions?.length || 0,
      timeLimit: 15,
      questions: quiz.questions.map((q) => {
        const answerIndex = q.options?.indexOf(q.correctAnswer);
        return {
          question: q.question,
          options: q.options || [],
          answer: answerIndex >= 0 ? answerIndex : 0,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        };
      }),
      documentId: quiz.documentId || null,
      documentName: document ? document.filename : null
    };
    
    res.json({ quiz: formattedQuiz });
  } catch (e) {
    console.error('Error fetching quiz:', e);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}

export async function generateQuizFromPdfController(req, res) {
  try {
    const { documentId } = req.params;
    const { numQuestions = 10, regenerate = false } = req.body || {};
    
    // Find the document
    const document = await Document.findOne({ id: documentId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    if (!document.text || document.text.trim().length === 0) {
      return res.status(400).json({ error: 'Document has no extractable text' });
    }
    
    // Check if text is too short
    const textLength = document.text.trim().length;
    if (textLength < 100) {
      return res.status(400).json({ error: 'Document text is too short to generate meaningful questions. Please ensure the PDF has sufficient content.' });
    }
    
    // Check if quiz already exists for this PDF (to save tokens)
    if (!regenerate) {
      const existingQuiz = await Quiz.findOne({ 
        documentId: document.id,
        questions: { $exists: true, $ne: [] } // Has questions
      }).sort({ createdAt: -1 }); // Get the most recent one
      
      if (existingQuiz && existingQuiz.questions && existingQuiz.questions.length > 0) {
        console.log(`Using existing quiz for PDF: ${document.filename}`);
        
        // Format existing quiz
        const formattedQuiz = {
          id: existingQuiz._id.toString(),
          title: existingQuiz.topic || `Quiz from ${document.filename}`,
          subject: 'General',
          difficulty: 'Medium',
          questionCount: existingQuiz.questions?.length || 0,
          timeLimit: 15,
          description: `Quiz generated from ${document.filename}`,
          questions: existingQuiz.questions.map((q) => {
            const answerIndex = q.options?.indexOf(q.correctAnswer);
            return {
              question: q.question,
              options: q.options || [],
              answer: answerIndex >= 0 ? answerIndex : 0,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || ''
            };
          }),
          documentId: existingQuiz.documentId,
          documentName: document.filename
        };
        
        return res.json({ 
          quiz: formattedQuiz, 
          id: existingQuiz._id,
          cached: true // Indicate this is a cached quiz
        });
      }
    }
    
    console.log(`Generating new quiz from PDF: ${document.filename}, text length: ${textLength}`);
    
    // Generate quiz from document text
    const quiz = await generateQuiz(document.text, { numQuestions });
    
    console.log(`Generated ${quiz.length} questions from PDF`);
    
    // Check if any questions were generated
    if (!quiz || quiz.length === 0) {
      return res.status(400).json({ 
        error: 'No questions could be generated from this PDF. The content may not be suitable for quiz generation. Try another file or paste text directly.' 
      });
    }
    
    // Validate and format questions
    const formattedQuestions = quiz
      .filter(q => q && q.question && q.options && Array.isArray(q.options) && q.options.length >= 2)
      .map(q => ({
        question: q.question,
        options: q.options || [],
        correctAnswer: q.options?.[q.answer] || q.correctAnswer || q.options?.[0] || '',
        explanation: q.explanation || ''
      }));
    
    if (formattedQuestions.length === 0) {
      return res.status(400).json({ 
        error: 'Generated questions were invalid. Please try again or use a different PDF.' 
      });
    }
    
    // Save quiz to database with documentId
    const savedQuiz = await Quiz.create({
      questions: formattedQuestions,
      sourceText: document.text.substring(0, 1000), // Store first 1000 chars as preview
      documentId: document.id,
      topic: `Quiz from ${document.filename}`
    });
    
    // Format response
    const formattedQuiz = {
      id: savedQuiz._id.toString(),
      title: savedQuiz.topic || 'Untitled Quiz',
      subject: 'General',
      difficulty: 'Medium',
      questionCount: savedQuiz.questions?.length || 0,
      timeLimit: 15,
      description: `Quiz generated from ${document.filename}`,
      questions: formattedQuestions,
      documentId: savedQuiz.documentId,
      documentName: document.filename
    };
    
    res.json({ quiz: formattedQuiz, id: savedQuiz._id, cached: false });
  } catch (e) {
    console.error('Error generating quiz from PDF:', e);
    res.status(500).json({ error: 'Failed to generate quiz from PDF', details: e.message });
  }
}

export async function submitQuizController(req, res) {
  try {
    const { quizId, score, total, answers, timeTakenSec } = req.body;
    
    // Save to analytics
    const Analytics = (await import('../models/Analytics.js')).default;
    const analytics = await Analytics.getOrCreate();
    analytics.history.push({
      score,
      total,
      topic: 'Quiz',
      timeTakenSec: timeTakenSec || 0,
      at: new Date()
    });
    await analytics.save();
    
    res.json({ success: true, score, total });
  } catch (e) {
    console.error('Error submitting quiz:', e);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
}


