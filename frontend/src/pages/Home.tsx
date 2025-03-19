import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  name: string;
  email: string;
  picture?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      <h1>Welcome, {user.name}</h1>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
      }}>
        {user.picture && (
          <img 
            src={user.picture} 
            alt="Profile" 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%' 
            }} 
          />
        )}
        <div>
          <p>Email: {user.email}</p>
        </div>
      </div>
      <button 
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
} 