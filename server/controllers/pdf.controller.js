import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Document from '../models/Document.js';

// Dynamic import for pdf-parse (ES module)
const pdfParseModule = await import('pdf-parse');
const { PDFParse } = pdfParseModule;

export async function extractPdfController(req, res) {
  let pdfParser = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });
    const dataBuffer = fs.readFileSync(req.file.path);
    
    // Use PDFParse class (pdf-parse v2.4.5+)
    pdfParser = new PDFParse({ data: dataBuffer });
    const result = await pdfParser.getText();
    const cleaned = (result.text || '')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const doc = new Document({
      id: uuidv4(),
      filename: req.file.originalname,
      storedPath: req.file.path,
      text: cleaned,
      createdAt: new Date()
    });

    await doc.save();

    res.json({ id: doc.id, filename: doc.filename, text: doc.text });
  } catch (e) {
    console.error('Error processing PDF:', e);
    res.status(500).json({ error: 'Failed to process PDF', details: e.message });
  } finally {
    // Clean up PDF parser instance
    if (pdfParser) {
      await pdfParser.destroy().catch(() => {});
    }
  }
}

export async function listDocsController(_req, res) {
  try {
    const items = await Document.find({}).sort({ createdAt: -1 }).select('id filename createdAt');
    res.json({ items: items.map(({ id, filename, createdAt }) => ({ id, filename, createdAt })) });
  } catch (e) {
    console.error('Error listing documents:', e);
    res.status(500).json({ error: 'Failed to list documents', details: e.message });
  }
}

export async function getDocController(req, res) {
  try {
    const doc = await Document.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, filename: doc.filename, text: doc.text });
  } catch (e) {
    console.error('Error getting document:', e);
    res.status(500).json({ error: 'Failed to get document', details: e.message });
  }
}

export async function deleteDocController(req, res) {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ id });
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete the physical file if it exists
    if (doc.storedPath && fs.existsSync(doc.storedPath)) {
      try {
        fs.unlinkSync(doc.storedPath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Delete associated flashcards
    const Flashcard = (await import('../models/Flashcard.js')).default;
    await Flashcard.deleteMany({ documentId: id });

    // Delete the document from MongoDB
    await Document.deleteOne({ id });

    res.json({ message: 'Document deleted successfully', id });
  } catch (e) {
    console.error('Error deleting document:', e);
    res.status(500).json({ error: 'Failed to delete document', details: e.message });
  }
}


