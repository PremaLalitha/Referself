import { useNavigate } from 'react-router-dom';
import '../styles/AuthChoicePage.css';

function AuthChoicePage() {
  const navigate = useNavigate();
  return (
    <div className="auth-choice-container">
      <h2>Welcome to ReferShelf</h2>
      <p>Choose how you'd like to continue:</p>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/signup')}>Sign Up</button>
    </div>
  );
}

export default AuthChoicePage;
