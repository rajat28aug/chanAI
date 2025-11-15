import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: {
      type: String
    }
  }],
  sourceText: {
    type: String
  },
  documentId: {
    type: String,
    ref: 'Document'
  },
  topic: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);

