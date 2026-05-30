import API_BASE from '../config/api.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signupPage.css';
import { handleGoogleAuth } from '../utils/googleLogin'; // Import the corrected util

function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Step 1: Send OTP (Manual Signup)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        let message = data.message || '✅ OTP sent to your email!';
        if (data.previewUrl) {
          message += `\n\nPreview URL:\n${data.previewUrl}`;
        }
        alert(message);
        if (data.debug) {
          console.warn(data.debug);
        }
        setStep(2);
      } else {
        alert(data.message || '❌ Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Verify OTP and Complete Signup (Manual)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(password)) {
      alert('⚠️ Password must be at least 6 characters long and include uppercase, lowercase, number, and symbol.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('🎉 Signup successful! You can now log in.');
        navigate('/login');
      } else {
        alert(data.message || '❌ Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google Signup/Login (Seamless – Creates User if New)
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    try {
      handleGoogleAuth(); // Redirects to backend /api/auth/google
      // Note: Success handled in GoogleAuthSuccess.jsx (stores data, navigates to /home)
    } catch (err) {
      console.error('Google signup error:', err);
      alert('Google signup failed. Please try manual signup.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>

      {/* ✅ Step 1: Enter details & send OTP (Manual) */}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading || googleLoading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <div className="divider"></div>  {/* ✅ Fixed: No inner text */}

          {/* ✅ Continue with Google – Now with Loading & Better UX */}
          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <span>Signing up with Google...</span>
            ) : (
              <>
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google Logo"
                  style={{ width: '18px', marginRight: '8px' }}
                />
                Continue with Google
              </>
            )}
          </button>

          <p>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="link">
              Login
            </span>
          </p>
        </form>
      )}

      {/* ✅ Step 2: Verify OTP (Manual Only) */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP & Signup'}
          </button>

          {/* Back to Step 1 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ marginTop: '10px', background: '#f0f0f0' }}
          >
            Back to Details
          </button>
        </form>
      )}
    </div>
  );
}

export default SignupPage;