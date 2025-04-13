import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google response:', credentialResponse);

      const response = await fetch('http://localhost:5000/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();
      if (data.access_token && data.refresh_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',  // This ensures full viewport coverage
      top: 0,
      left: 0,
      gap: '20px',
      padding: '20px',
      boxSizing: 'border-box',
      textAlign: 'center',
      background: '#f8f9fa',  // Optional: adds a subtle background
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '90%',  // Ensures content doesn't overflow on mobile
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          margin: 0,  // Remove default margins
          color: '#343a40',  // Darker text for better contrast
        }}>Welcome</h1>
        
        <div style={{  // Wrapper for the Google login button
          transform: 'scale(1.2)',  // Makes the button slightly larger
          margin: '10px 0',
        }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.error('Google login failed');
              setError('Google login failed');
            }}
          />
        </div>

        {error && (
          <p style={{ 
            color: '#dc3545',
            margin: 0,
            fontSize: '0.9rem',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
} 