import { generateSummary } from '../services/together.service.js';

export async function summarizeController(req, res) {
  try {
    const { text, pages, detail = 'medium' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    const summary = await generateSummary(text, { pages, detail });
    res.json({ summary });
  } catch (e) {
    console.error('Error in summarizeController:', e);
    res.status(500).json({ error: 'Failed to summarize', details: e.message });
  }
}


