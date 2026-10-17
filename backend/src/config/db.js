import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  const uri = config.mongoUri;
  if (!uri) {
    console.log('ℹ️  [MongoDB] No MONGODB_URI configured in .env. Running with in-memory store.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🍃 [MongoDB Atlas] Connected successfully to Database!');
  } catch (err) {
    console.warn('⚠️  [MongoDB Atlas Connection Error]:', err.message);
    console.log('ℹ️  System will continue running with in-memory fallback.');
  }
};
