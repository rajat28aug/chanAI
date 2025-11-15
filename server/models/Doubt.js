import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    default: 'general'
  },
  imageBase64: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Doubt', doubtSchema);

