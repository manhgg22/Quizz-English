// src/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, [location.pathname]); // Re-check when route changes

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuthData();
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Don't show header on login and register pages
  const hideHeaderPaths = ['/login', '/register', '/forgot-password', '/welcome'];
  if (hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  // Show loading state briefly
  if (isLoading) {
    return (
      <header style={{ 
        padding: '10px 20px', 
        backgroundColor: '#007bff', 
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60px'
      }}>
        <div>Đang tải...</div>
      </header>
    );
  }

  return (
    <header style={{ 
      padding: '10px 20px', 
      backgroundColor: '#007bff', 
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h1 
          style={{ 
            margin: 0, 
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
          onClick={() => handleNavigation('/home')}
        >
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
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.95rem',
                textDecoration: 'none',
                backgroundColor: location.pathname === '/home' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/home') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/home') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              🏠 Trang chủ
            </button>
            
            <button 
              onClick={() => handleNavigation('/user/results')}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.95rem',
                textDecoration: 'none',
                backgroundColor: location.pathname === '/user/results' ? 'rgba(255,255,255,0.2)' : 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/user/results') {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/user/results') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              📊 Lịch sử
            </button>

            {/* Admin menu */}
            {user.role === 'admin' && (
              <button 
                onClick={() => handleNavigation('/admin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  backgroundColor: location.pathname.includes('/admin') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!location.pathname.includes('/admin')) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!location.pathname.includes('/admin')) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                ⚙️ Quản trị
              </button>
            )}
          </nav>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            borderLeft: '1px solid rgba(255,255,255,0.3)',
            paddingLeft: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '0.9rem'
            }}>
              <span style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem'
              }}>
                {user.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
              <span>👋 {user.email}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              🚪 Đăng xuất
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
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#007bff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'white';
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
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(0)';
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