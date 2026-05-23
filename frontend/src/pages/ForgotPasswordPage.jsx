import API_BASE from '../config/api.js';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password-send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setStep(2);
    } else alert(data.message);
  };

  const resetPassword = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Password must be strong");
      return;
    }

    const res = await fetch(`${API_BASE}/api/auth/forgot-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else alert(data.message);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button onClick={sendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Reset Password</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button onClick={resetPassword} disabled={success}>
              {success ? 'Redirecting...' : 'Reset Password'}
            </button>

            {success && (
              <button className="go-login-btn" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
