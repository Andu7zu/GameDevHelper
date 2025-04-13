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
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#343a40',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: window.innerWidth < 768 ? '10px' : '0',
        }}>
          <button onClick={() => handleNavigation('/dashboard')} style={buttonStyle}>Dashboard</button>
          <button onClick={() => handleNavigation('/reports')} style={buttonStyle}>Reports</button>
          <button onClick={() => handleNavigation('/settings')} style={buttonStyle}>Settings</button>
          <button onClick={() => handleNavigation('/soundGenerator')} style={buttonStyle}>Sound Generator</button>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={toggleDropdown} style={{ ...buttonStyle, cursor: 'pointer' }}>
            {user.name} <span style={{ marginLeft: '5px' }}>▼</span>
          </button>
          {dropdownVisible && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              backgroundColor: 'white',
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              zIndex: 1,
              minWidth: '150px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
              <button onClick={() => handleNavigation('/profile')} style={dropdownItemStyle}>Profile</button>
              <button onClick={() => handleNavigation('/manage-credits')} style={dropdownItemStyle}>Manage Credits</button>
              <button onClick={handleLogout} style={dropdownItemStyle}>Logout</button>
            </div>
          )}
        </div>
      </nav>
      <div style={{
        padding: '80px 20px',
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
      </div>
    </div>
  );
}

const buttonStyle = {
  marginRight: '10px',
  padding: '8px 16px',
  backgroundColor: '#495057',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px',
  textAlign: 'left',
  backgroundColor: 'white',
  border: 'none',
  cursor: 'pointer',
  borderBottom: '1px solid #dee2e6',
  color: '#343a40',
}; 