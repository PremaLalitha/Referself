import API_BASE from '../config/api.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { handleGoogleAuth } from '../utils/googleLogin'; // ✅ Google Login helper

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userCoins', data.coins);
        localStorage.setItem('currentStreak', data.currentStreak);
        localStorage.setItem('maxStreak', data.maxStreak);

        alert('Login successful!');
        let target = data.redirect || (data.role === 'Admin' ? '/admin' : '/home');
        if (typeof target === 'string') target = target.replace('/homepage', '/home');
        navigate(target);
      } else {
        if (data.message && data.message.includes('removed')) {
          alert('Your account has been removed. Please contact support if you believe this is an error.');
        } else {
          alert(data.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      <form onSubmit={handleLogin}>
        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />



        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Google Login */}
        <button
          type="button"
          className="google-login-btn"
          onClick={async () => {
            setGoogleLoading(true);
            try {
              await handleGoogleAuth();
            } catch (err) {
              console.error('Google login error:', err);
              alert('Google login failed. Please try again.');
            } finally {
              setGoogleLoading(false);
            }
          }}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <span>Signing in with Google...</span>
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

        {/* ✅ Links moved INSIDE the form */}
        <div className="form-links">
          <p>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} className="link">Sign Up</span>
          </p>
          <p>
            Forgot your password?{' '}
            <span onClick={() => navigate('/forgot-password')} className="link">Reset here</span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
