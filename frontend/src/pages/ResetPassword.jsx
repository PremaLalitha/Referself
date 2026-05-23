import API_BASE from '../config/api.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/ResetPasswordPage.css';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (res.status === 200) {
        setMessage(data.message || 'Password reset successful!');
        setSuccess(true);
        // redirect to Login page after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Error resetting password');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    }
  };

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={success}>
          {success ? 'Redirecting...' : 'Reset Password'}
        </button>
      </form>

      {message && <p>{message}</p>}

      {/* If reset was successful show a clear button to go to Login immediately */}
      {success && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 12px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Go to Login
          </button>
        </div>
      )}

      {/* Login button to navigate manually */}
      <p>
        Already have an account?{' '}
        <button 
          onClick={() => navigate('/login')} 
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
        >
          Login
        </button>
      </p>
    </div>
  );
}
