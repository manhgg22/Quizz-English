// src/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Không hiển thị header trên trang login và register
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header style={{ 
      padding: '10px 20px', 
      backgroundColor: '#007bff', 
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          🦆 DuckMen Quiz System
        </h1>
      </div>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => handleNavigation('/home')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textDecoration: location.pathname === '/home' ? 'underline' : 'none'
              }}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => handleNavigation('/user/results')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textDecoration: location.pathname === '/user/results' ? 'underline' : 'none'
              }}
            >
              Lịch sử
            </button>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>👋 {user.email}</span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleNavigation('/login')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => handleNavigation('/register')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#007bff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Đăng ký
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;