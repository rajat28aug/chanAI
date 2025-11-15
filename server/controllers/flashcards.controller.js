import { generateFlashcards } from '../services/together.service.js';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';

// Get list of PDFs for selection
export async function getPdfsForFlashcardsController(_req, res) {
  try {
    const documents = await Document.find({}).sort({ createdAt: -1 }).select('id filename createdAt');
    res.json({ pdfs: documents });
  } catch (e) {
    console.error('Error getting PDFs:', e);
    res.status(500).json({ error: 'Failed to get PDFs', details: e.message });
  }
}

// Generate flashcards for a specific PDF
export async function generateFlashcardsForPdfController(req, res) {
  try {
    const { documentId } = req.params;
    
    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    // Get the PDF document first (needed for both cached and new generation)
    const document = await Document.findOne({ id: documentId });
    if (!document) {
      return res.status(404).json({ error: 'PDF document not found' });
    }

    // Validate document has text content
    if (!document.text || document.text.trim().length < 50) {
      return res.status(400).json({ 
        error: 'PDF document has insufficient text content',
        details: 'The PDF either has no extractable text or the text is too short to generate flashcards.'
      });
    }

    // Check if flashcards already exist for this PDF
    const existingFlashcards = await Flashcard.find({ documentId }).sort({ createdAt: -1 });
    if (existingFlashcards.length > 0) {
      return res.json({ 
        flashcards: existingFlashcards.map(f => ({
          question: f.question,
          answer: f.answer,
          tag: f.tag
        })),
        cached: true,
        message: 'Flashcards retrieved from cache',
        filename: document.filename,
        documentId: document.id
      });
    }

    // Generate flashcards using AI
    let generatedFlashcards;
    try {
      generatedFlashcards = await generateFlashcards(document.text);
    } catch (error) {
      console.error('Error calling generateFlashcards:', error);
      return res.status(500).json({ 
        error: 'Failed to generate flashcards', 
        details: error.message || 'AI service error' 
      });
    }
    
    if (!Array.isArray(generatedFlashcards) || generatedFlashcards.length === 0) {
      console.error('No flashcards generated. Response:', generatedFlashcards);
      return res.status(500).json({ 
        error: 'Failed to generate flashcards or no flashcards generated',
        details: 'The AI model did not return any flashcards. Please try again or check if the PDF content is sufficient.'
      });
    }

    // Save flashcards to database
    const flashcardsToSave = generatedFlashcards.map(card => ({
      documentId,
      question: card.question || '',
      answer: card.answer || '',
      tag: card.tag || ''
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcardsToSave);

    res.json({ 
      flashcards: savedFlashcards.map(f => ({
        question: f.question,
        answer: f.answer,
        tag: f.tag
      })),
      cached: false,
      message: 'Flashcards generated and saved',
      filename: document.filename,
      documentId: document.id
    });
  } catch (e) {
    console.error('Error generating flashcards:', e);
    res.status(500).json({ error: 'Failed to generate flashcards', details: e.message });
  }
}

// Get flashcards for a specific PDF
export async function getFlashcardsForPdfController(req, res) {
  try {
    const { documentId } = req.params;
    
    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    // Verify PDF exists
    const document = await Document.findOne({ id: documentId });
    if (!document) {
      return res.status(404).json({ error: 'PDF document not found' });
    }

    // Get flashcards
    const flashcards = await Flashcard.find({ documentId }).sort({ createdAt: -1 });
    
    res.json({ 
      flashcards: flashcards.map(f => ({
        question: f.question,
        answer: f.answer,
        tag: f.tag
      })),
      documentId,
      filename: document.filename
    });
  } catch (e) {
    console.error('Error getting flashcards:', e);
    res.status(500).json({ error: 'Failed to get flashcards', details: e.message });
  }
}

// Legacy endpoint - keep for backward compatibility
export async function flashcardsController(req, res) {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    const flashcards = await generateFlashcards(text);
    res.json({ flashcards });
  } catch (e) {
    console.error('Error generating flashcards:', e);
    res.status(500).json({ error: 'Failed to generate flashcards', details: e.message });
  }
}


