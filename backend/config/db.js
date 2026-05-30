const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!process.env.MONGO_URI) {
        throw new Error('PRODUCTION ERROR: MONGO_URI environment variable is missing. Please add it to your hosting provider settings.');
      }
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully to production database');
    } else {
      // Try to connect to the provided MONGO_URI first (in development)
      if (process.env.MONGO_URI) {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          console.log('MongoDB connected to external database');
        } catch (externalErr) {
          console.warn('External MongoDB connection failed:', externalErr.message);
          console.log('Falling back to in-memory MongoDB...');
          // Fallback to in-memory MongoDB for development
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          await mongoose.connect(mongoUri);
          console.log('MongoDB connected to in-memory database (fallback)');
        }
      } else {
        // Fallback to in-memory MongoDB for development
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected to in-memory database');
      }
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
