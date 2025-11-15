import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  history: [{
    score: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    timeTakenSec: {
      type: Number,
      default: 0
    },
    at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure only one analytics document exists
analyticsSchema.statics.getOrCreate = async function() {
  let analytics = await this.findOne();
  if (!analytics) {
    analytics = await this.create({ history: [] });
  }
  return analytics;
};

export default mongoose.model('Analytics', analyticsSchema);

