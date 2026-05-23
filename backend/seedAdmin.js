const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    // Connect to MongoDB with consistent lowercase database name
    await mongoose.connect('mongodb://localhost:27017/refershelf');

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'referself08@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Refer-Self8', 10);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      username: 'admin',
      email: 'referself08@gmail.com',
      password: hashedPassword,
      role: 'Admin',
      coins: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastMilestoneAwarded: 0
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: referself08@gmail.com');
    console.log('Password: Refer-Self8');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedAdmin();
