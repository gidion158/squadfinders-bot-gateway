import mongoose from 'mongoose';
import { config } from './index.js';
import logger from '../utils/logger.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected successfully', {
      uri: config.mongodb.uri.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
    });
  } catch (error) {
    logger.error('MongoDB connection failed', {
      error: error.message,
      uri: config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')
    });
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', {
      error: error.message
    });
  }
};