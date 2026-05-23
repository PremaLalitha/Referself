import API_BASE from '../config/api.js';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export const handleGoogleAuth = async () => {
  try {
    // Sign in user with Google Popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // ✅ Send user details to your backend to save or verify
    const res = await fetch(`${API_BASE}/api/auth/google-signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
      }),
    });

    const data = await res.json();

    // ✅ Save locally and redirect
    if (res.ok) {
      // store the JWT under both keys for compatibility with existing code
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
      }

      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role || 'User');
      localStorage.setItem('userCoins', data.coins);
      localStorage.setItem('currentStreak', data.currentStreak);
      localStorage.setItem('maxStreak', data.maxStreak);
      localStorage.setItem('coins', data.coins || 0);
      localStorage.setItem('currentStreak', data.currentStreak || 0);
      localStorage.setItem('maxStreak', data.maxStreak || 0);

      // prefer backend-provided redirect, normalize '/homepage' to '/home'
      let target = data.redirect || '/home';
      if (typeof target === 'string') target = target.replace('/homepage', '/home');
      window.location.href = target;
    } else {
      alert(data.message || 'Google authentication failed.');
    }
  } catch (err) {
    console.error("Google signup/login failed:", err);
    alert("Google authentication failed.");
  }
};
