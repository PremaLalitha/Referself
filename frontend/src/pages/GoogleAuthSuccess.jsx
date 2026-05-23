import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const data = searchParams.get('data');
    
    if (data) {
      try {
        const userData = JSON.parse(decodeURIComponent(data));
        
        // Store user data in localStorage
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('token', userData.token);

        // Redirect based on role
        if (userData.role === 'Admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/home');
        }
      } catch (err) {
        console.error('Error parsing Google auth data:', err);
        navigate('/login?error=auth_failed');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Completing Google Sign In...</h2>
      <p>Please wait while we redirect you.</p>
    </div>
  );
}

export default GoogleAuthSuccess;