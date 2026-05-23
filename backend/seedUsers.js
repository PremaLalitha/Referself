const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/refershelf');
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.find({ role: 'User' });
    if (existingUsers.length > 0) {
      console.log('Regular users already exist');
      return;
    }

    // Create test users
    const users = [
      {
        name: 'Dhivya',
        username: 'dhivya123',
        email: 'dhivya@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'User',
        coins: 4, // Assuming some uploads
        currentStreak: 5,
        maxStreak: 10,
        lastMilestoneAwarded: 0
      },
      {
        name: 'Premi',
        username: 'premi456',
        email: 'premi@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'User',
        coins: 2,
        currentStreak: 3,
        maxStreak: 8,
        lastMilestoneAwarded: 0
      },
      {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'User',
        coins: 1,
        currentStreak: 1,
        maxStreak: 1,
        lastMilestoneAwarded: 0
      }
    ];

    await User.insertMany(users);
    console.log('Test users seeded successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
