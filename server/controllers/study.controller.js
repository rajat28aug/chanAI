import Analytics from '../models/Analytics.js';

export async function studyPathController(req, res) {
  const { performance = {} } = req.body || {};
  // Very simple adaptive logic example
  const weakTopics = Object.entries(performance)
    .filter(([, v]) => v.correctRate < 0.6)
    .map(([k]) => k);

  const recommendation = weakTopics.length
    ? weakTopics.map(t => ({ topic: t, level: 'easy' }))
    : [{ topic: 'Next Chapter', level: 'medium' }];

  res.json({ recommendation });
}

export async function analyticsController(_req, res) {
  try {
    const analytics = await Analytics.getOrCreate();
    res.json({ history: analytics.history });
  } catch (e) {
    console.error('Error getting analytics:', e);
    res.status(500).json({ error: 'Failed to get analytics', details: e.message });
  }
}

export async function quizResultController(req, res) {
  try {
    const { score, total, topic, timeTakenSec } = req.body || {};
    const analytics = await Analytics.getOrCreate();
    analytics.history.push({ 
      score, 
      total, 
      topic, 
      timeTakenSec, 
      at: new Date() 
    });
    await analytics.save();
    res.json({ ok: true });
  } catch (e) {
    console.error('Error saving quiz result:', e);
    res.status(500).json({ error: 'Failed to save quiz result', details: e.message });
  }
}


