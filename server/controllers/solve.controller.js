import { solveFromImage } from '../services/ocr.service.js';
import { solveTextWithAI } from '../services/together.service.js';

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
    res.status(500).json({ error: 'Failed to solve question' });
  }
}


