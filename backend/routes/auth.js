const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// ====================
// Email + OTP Auth
// ====================

// Signup
router.post("/signup-send-otp", authController.signupSendOtp);
router.post("/signup-verify-otp", authController.signupVerifyOtp);

// Login
router.post("/login", authController.login);

// Forgot password
router.post("/forgot-password-send-otp", authController.forgotPasswordSendOtp);
router.post("/forgot-password-reset", authController.resetPassword);

// ====================
// Google OAuth
// ====================

// Step 1: Redirect user to Google for authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Handle callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect('http://localhost:5173/login?error=auth_failed');
      }
      const token = jwt.sign({ id: user._id, role: user.role || 'User' }, process.env.JWT_SECRET, { expiresIn: "1d" });
      const userData = {
        token,
        name: user.name,
        email: user.email,
        role: user.role || 'User',
        redirect: user.role === 'Admin' ? '/admin' : '/home'
      };
      const encodedData = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`http://localhost:5173/auth/google-success?data=${encodedData}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('http://localhost:5173/login?error=auth_failed');
    }
  }
);

// Endpoint to accept Firebase popup user info and issue backend JWT
router.post("/google-signup", authController.googleSignup);

module.exports = router;