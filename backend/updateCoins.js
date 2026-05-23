const mongoose = require('mongoose');
const User = require('./models/User');
const Resource = require('./models/Resource');

async function updateCoins() {
  try {
    // Connect to MongoDB (adjust connection string if needed)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/refershelf');

    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find();

    for (const user of users) {
      // Count uploads by this user (assuming uploadedBy is email)
      const uploadCount = await Resource.countDocuments({ uploadedBy: user.email });
      user.coins = uploadCount;
      await user.save();
      console.log(`Updated ${user.name || user.email}: ${uploadCount} coins`);
    }

    console.log('All coins updated successfully');
  } catch (err) {
    console.error('Error updating coins:', err);
  } finally {
    mongoose.disconnect();
  }
}

updateCoins();
