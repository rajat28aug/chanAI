import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    index: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  tag: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries by documentId
flashcardSchema.index({ documentId: 1, createdAt: -1 });

export default mongoose.model('Flashcard', flashcardSchema);

