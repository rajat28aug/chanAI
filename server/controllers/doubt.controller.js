import { solveFromImage } from '../services/ocr.service.js';
import { solveTextWithAI } from '../services/together.service.js';
import Doubt from '../models/Doubt.js';

export async function solveController(req, res) {
  try {
    const { imageBase64, text } = req.body || {};
    if (!imageBase64 && !text) return res.status(400).json({ error: 'imageBase64 or text is required' });

    let extractedText = text;
    if (imageBase64) {
      extractedText = await solveFromImage(imageBase64);
    }
    const solution = await solveTextWithAI(extractedText);
    res.json({ solution, extractedText });
  } catch (e) {
    console.error('Error solving question:', e);
    res.status(500).json({ error: 'Failed to solve question' });
  }
}

export async function doubtController(req, res) {
  try {
    const { imageBase64, text, subject = 'general' } = req.body || {};
    if (!imageBase64 && !text) {
      return res.status(400).json({ error: 'imageBase64 or text is required' });
    }

    let extractedText = text;
    if (imageBase64) {
      extractedText = await solveFromImage(imageBase64);
    }

    const solution = await solveTextWithAI(extractedText || text);

    // Save to database
    const doubt = await Doubt.create({
      question: extractedText || text,
      answer: solution,
      subject,
      imageBase64: imageBase64 || undefined
    });

    res.json({ 
      solution, 
      answer: solution,
      extractedText,
      id: doubt._id.toString()
    });
  } catch (e) {
    console.error('Error solving doubt:', e);
    res.status(500).json({ error: 'Failed to solve doubt' });
  }
}

export async function getDoubtsController(req, res) {
  try {
    const doubts = await Doubt.find().sort({ createdAt: -1 }).limit(50);
    const formattedDoubts = doubts.map(doubt => ({
      id: doubt._id.toString(),
      question: doubt.question,
      answer: doubt.answer,
      subject: doubt.subject,
      createdAt: doubt.createdAt.toISOString()
    }));
    res.json({ doubts: formattedDoubts });
  } catch (e) {
    console.error('Error fetching doubts:', e);
    res.status(500).json({ error: 'Failed to fetch doubts' });
  }
}

