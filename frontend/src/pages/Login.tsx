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
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Backend error: ${errorText}`);
      }

      const data = await response.json();
      console.log('Login successful:', data);
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('Navigating to home...');
      window.location.href = '/';  // Use window.location for a full page refresh
    } catch (error) {
      console.error('Login error:', error);
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
      gap: '20px'
    }}>
      <h1>Welcome</h1>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.error('Google login failed');
          setError('Google login failed');
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
} 