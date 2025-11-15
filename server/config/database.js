import mongoose from 'mongoose';

// URL encode the password to handle special characters (^ becomes %5E)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Rajat:Algo%5E2002@cluster0.vft7tq3.mongodb.net/';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ai_study_buddy'
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

