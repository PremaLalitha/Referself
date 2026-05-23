const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {           // username
    type: String,
    required: true,
  },
  email: {              // unique email
    type: String,
    required: true,
    unique: true,
  },
  password: {           // hashed password
    type: String,
    required: true,
  },
  role: {               // User or Admin
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
  createdAt: {          // account creation time
    type: Date,
    default: Date.now,
  },
  updatedAt: {          // account last update time
    type: Date,
    default: Date.now,
  },
  dob: {                // date of birth
    type: Date,
  },
  phone: {              // phone number (optional)
    type: String,
  },

  subjectsOfInterest: { // subjects of interest
    type: [String],
    default: [],
  },
  notificationSettings: { // notification preferences
    resourceUpdates: {
      type: Boolean,
      default: true,
    },
    messages: {
      type: Boolean,
      default: true,
    },
  },
  bio: {                // short bio
    type: String,
  },
  profileImage: {       // profile image path
    type: String,
  },
  socialLinks: {        // social media links
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  googleId: {           // Google OAuth ID
    type: String,
  },
  isGoogleConnected: {  // whether Google account is connected
    type: Boolean,
    default: false,
  },
  banned: {             // whether user is banned
    type: Boolean,
    default: false,
  },
  warnings: {           // number of warnings issued
    type: Number,
    default: 0,
  },
  status: {             // user account status
    type: String,
    enum: ['active', 'warned', 'removed'],
    default: 'active',
  },
  lastLogin: {          // last login timestamp
    type: Date,
  },
  currentStreak: {      // current login streak in days
    type: Number,
    default: 0,
  },
  lastStreakDate: {     // last date when streak was updated
    type: Date,
  },
  maxStreak: {          // maximum streak achieved
    type: Number,
    default: 0,
  },
  coins: {              // total coins earned
    type: Number,
    default: 0,
  },
  lastMilestoneAwarded: { // last milestone (e.g., 10, 20) that awarded coins
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('User', userSchema);
