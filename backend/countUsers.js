const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function countUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/referself');
    const count = await User.countDocuments();
    console.log(`Total users: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error('Error counting users:', error);
    process.exit(1);
  }
}

countUsers();
