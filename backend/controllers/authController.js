const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");

// =======================
// Step 1: Signup - Send OTP
// =======================
exports.signupSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    try {
      const emailResult = await sendEmail({ to: email, subject: "Signup OTP", text: `Your signup OTP is: ${otp}` });
      if (emailResult.previewUrl) {
        console.log(`[Signup OTP] Email preview URL: ${emailResult.previewUrl}`);
        return res.json({
          message: "OTP sent using development email preview.",
          previewUrl: emailResult.previewUrl,
          debug: "Check backend console or preview URL for the test email.",
        });
      }
      res.json({ message: "OTP sent to your email" });
    } catch (emailError) {
      console.error("[Signup OTP] Email send failed:", emailError);

      if (process.env.NODE_ENV !== 'production') {
        console.warn("[Signup OTP] Development fallback enabled: OTP will still work from server console.");
        console.log(`OTP for ${email}: ${otp}`);
        return res.json({
          message: "OTP send failed, but OTP has been generated successfully.",
          debug: "Check backend console for the OTP in development mode.",
        });
      }

      throw emailError;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Step 2: Verify OTP & Signup
// =======================
exports.signupVerifyOtp = async (req, res) => {
  try {
    const { name, username, email, password, otp } = req.body;

    const record = await Otp.findOne({ email: email.toLowerCase().trim(), otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ message: "Weak password" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "User", // Always User
    });

    await newUser.save();
    await Otp.deleteOne({ _id: record._id });

    res.status(201).json({ message: "Signup successful", user: { name, email, role: "User" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Login
// =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ----- Admin login -----
    if (email.toLowerCase().trim() === "referself08@gmail.com") {
      if (password === "Refer-Self8") {
    const token = jwt.sign({ email, role: "Admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({
      token,
      name: "Admin",
      email,
      role: "Admin",
      redirect: "/admin" // Updated to match frontend route
    });
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // ----- Regular User login -----
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is removed
    if (user.status === 'removed') {
      return res.status(403).json({ message: "Your account has been removed. Please contact support if you believe this is an error." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Update login streak
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate.getFullYear(), user.lastStreakDate.getMonth(), user.lastStreakDate.getDate()) : null;

    let currentStreak = user.currentStreak || 0;
    let maxStreak = user.maxStreak || 0;
    let coins = user.coins || 0;
    let lastMilestoneAwarded = user.lastMilestoneAwarded || 0;

    if (!lastStreakDate) {
      // First login
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak += 1;
      } else if (daysDiff > 1) {
        // Gap in login, reset streak
        currentStreak = 1;
      }
      // If daysDiff === 0, same day login, keep current streak
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    // Award coins for milestones (every 10 days: 10, 20, 30, etc.)
    if (currentStreak >= 10 && currentStreak % 10 === 0 && currentStreak > lastMilestoneAwarded) {
      coins += 2;
      lastMilestoneAwarded = currentStreak;
    }

    // Update user with new streak data, coins, and last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: now,
      currentStreak,
      lastStreakDate: today,
      maxStreak,
      coins,
      lastMilestoneAwarded
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: "User" }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      name: user.name,
      username: user.username,
      email: user.email,
      role: "User",
      redirect: "/home", // Updated to match frontend route
      currentStreak,
      maxStreak,
      coins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Forgot Password - Send OTP
// =======================
exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendEmail({ to: email, subject: "Password Reset OTP", text: `Your OTP is: ${otp}` });
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Forgot Password - Verify OTP & Reset
// =======================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "All fields required" });

    const record = await Otp.findOne({ email: email.toLowerCase().trim(), otp });
    if (!record) return res.status(400).json({ message: "Invalid OTP" });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(newPassword)) return res.status(400).json({ message: "Weak password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { password: hashed });
    await Otp.deleteOne({ _id: record._id });

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Google signup/login (for Firebase popup flow)
// Accepts { name, email, googleId } from frontend, creates user if missing, returns JWT
// =======================
exports.googleSignup = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && user.status === 'removed') {
      return res.status(403).json({ message: "Your account has been removed. Please contact support if you believe this is an error." });
    }
    if (!user) {
      // Create a unique username from email or name
      const base = (email.split('@')[0] || (name || 'user').replace(/\s+/g, '').toLowerCase());
      let username = base;
      let exists = await User.findOne({ username });
      let suffix = 1;
      while (exists) {
        username = `${base}${suffix++}`;
        exists = await User.findOne({ username });
      }

      // Generate a random password (required by schema) and hash it
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name: name || username,
        username,
        email: email.toLowerCase().trim(),
        password: hashed,
        role: 'User',
      });

      await user.save();
    }

    // Update login streak for Google login
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate.getFullYear(), user.lastStreakDate.getMonth(), user.lastStreakDate.getDate()) : null;

    let currentStreak = user.currentStreak || 0;
    let maxStreak = user.maxStreak || 0;
    let coins = user.coins || 0;
    let lastMilestoneAwarded = user.lastMilestoneAwarded || 0;

    if (!lastStreakDate) {
      // First login
      currentStreak = 1;
    } else {
      const daysDiff = Math.floor((today - lastStreakDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak += 1;
      } else if (daysDiff > 1) {
        // Gap in login, reset streak
        currentStreak = 1;
      }
      // If daysDiff === 0, same day login, keep current streak
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    // Award coins for milestones (every 10 days: 10, 20, 30, etc.)
    if (currentStreak >= 10 && currentStreak % 10 === 0 && currentStreak > lastMilestoneAwarded) {
      coins += 2;
      lastMilestoneAwarded = currentStreak;
    }

    // Update user with new streak data, coins, and last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: now,
      currentStreak,
      lastStreakDate: today,
      maxStreak,
      coins,
      lastMilestoneAwarded
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role || 'User' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role || 'User',
      redirect: user.role === 'Admin' ? '/admin' : '/home',
      currentStreak,
      maxStreak,
      coins
    });
  } catch (err) {
    console.error('googleSignup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};