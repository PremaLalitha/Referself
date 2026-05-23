const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try to connect to the provided MONGO_URI first
    if (process.env.MONGO_URI) {
      try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected to external database');
      } catch (externalErr) {
        console.warn('External MongoDB connection failed:', externalErr.message);
        console.log('Falling back to in-memory MongoDB...');
        // Fallback to in-memory MongoDB for development
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected to in-memory database (fallback)');
      }
    } else {
      // Fallback to in-memory MongoDB for development
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected to in-memory database');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
