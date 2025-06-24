import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Dropdown, 
  Avatar, 
  Spin, 
  Badge,
  Space,
  Typography,
  theme,
  message
} from 'antd';
import {
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  UserOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = () => {
  const [user, setUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/home');
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({
    totalTests: 0,
    recentTests: 0,
    pendingResults: 0
  });
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const { token } = theme.useToken();
  
  // API endpoints
  const API_BASE = 'http://localhost:3001/api' || process.env.REACT_APP_API_URL;
  
  // Navigation function
  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    console.log('Navigating to:', path);
  };

  const hideHeaderPaths = ['/login', '/register', '/forgot-password', '/welcome'];

  // Load user data immediately from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Load additional data in background
          loadAdditionalDataInBackground(parsedUser.id, token);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Load additional data in background
  const loadAdditionalDataInBackground = async (userId, token) => {
    setIsStatsLoading(true);
    
    try {
      const [statsResult, notificationsResult] = await Promise.allSettled([
        loadUserStats(userId, token),
        loadNotifications(userId, token)
      ]);

      if (statsResult.status === 'rejected') {
        console.error('Failed to load user stats:', statsResult.reason);
      }
      if (notificationsResult.status === 'rejected') {
        console.error('Failed to load notifications:', notificationsResult.reason);
      }
    } catch (error) {
      console.error('Error loading additional data:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Load user statistics
  const loadUserStats = async (userId, token) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const stats = await response.json();
        setUserStats({
          totalTests: stats.totalTests || 0,
          recentTests: stats.recentTests || 0,
          pendingResults: stats.pendingResults || 0
        });
      } else if (response.status === 401) {
        handleTokenExpired();
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  // Load notifications
  const loadNotifications = async (userId, token) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const notifs = await response.json();
        setNotifications(notifs || []);
      } else if (response.status === 401) {
        handleTokenExpired();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Handle token expiration
  const handleTokenExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    setUserStats({
      totalTests: 0,
      recentTests: 0,
      pendingResults: 0
    });
    message.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    navigate('/login');
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Non-blocking logout API call
        fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => console.error('Logout API error:', err));
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear data immediately
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_email');
    
    setUser(null);
    setNotifications([]);
    setUserStats({
      totalTests: 0,
      recentTests: 0,
      pendingResults: 0
    });
    
    navigate('/login');
    message.success('Đăng xuất thành công');
  };

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        if (!e.newValue) {
          setUser(null);
          setNotifications([]);
          setUserStats({
            totalTests: 0,
            recentTests: 0,
            pendingResults: 0
          });
        } else if (e.key === 'user' && e.newValue) {
          try {
            const newUser = JSON.parse(e.newValue);
            setUser(newUser);
          } catch (error) {
            console.error('Error parsing user data from storage:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Hide header on certain paths
  if (hideHeaderPaths.includes(currentPath)) return null;

  // Show minimal loading for initial load only
  if (isInitialLoading) {
    return (
      <AntHeader 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 50%, #13c2c2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          height: 64,
          padding: '0 16px'
        }}
      >
        <Spin size="small" style={{ color: 'white' }} />
      </AntHeader>
    );
  }

  const adminMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined style={{ color: token.colorPrimary }} />,
      label: (
        <Space>
          <Text>Trang chủ</Text>
          {currentPath === '/home' && <Badge status="processing" />}
        </Space>
      ),
      onClick: () => navigate('/home'),
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ color: token.colorWarning }} />,
      label: (
        <Space>
          <Text>Dashboard</Text>
          {userStats.recentTests > 0 && (
            <Badge count={userStats.recentTests} size="small" style={{ backgroundColor: token.colorWarning }} />
          )}
        </Space>
      ),
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'results',
      icon: <BarChartOutlined style={{ color: token.colorSuccess }} />,
      label: (
        <Space>
          <Text>Lịch sử kết quả</Text>
          {userStats.pendingResults > 0 && (
            <Badge count={userStats.pendingResults} size="small" style={{ backgroundColor: token.colorSuccess }} />
          )}
        </Space>
      ),
      onClick: () => navigate('/user/results'),
    },
    {
      key: 'admin',
      icon: <SettingOutlined style={{ color: token.colorWarning }} />,
      label: 'Quản trị hệ thống',
      onClick: () => navigate('/admin'),
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined style={{ color: token.colorInfo }} />,
      label: 'Trợ giúp & Hướng dẫn',
      onClick: () => navigate('/help'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: token.colorError }} />,
      label: <Text type="danger" strong>Đăng xuất</Text>,
      onClick: handleLogout,
    },
  ];

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined style={{ color: token.colorPrimary }} />,
      label: (
        <Space>
          <Text>Trang chủ</Text>
          {currentPath === '/home' && <Badge status="processing" />}
        </Space>
      ),
      onClick: () => navigate('/home'),
    },
    {
      key: 'results',
      icon: <BarChartOutlined style={{ color: token.colorSuccess }} />,
      label: (
        <Space>
          <Text>Lịch sử kết quả</Text>
          {userStats.pendingResults > 0 && (
            <Badge count={userStats.pendingResults} size="small" style={{ backgroundColor: token.colorSuccess }} />
          )}
        </Space>
      ),
      onClick: () => navigate('/user/results'),
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined style={{ color: token.colorInfo }} />,
      label: 'Trợ giúp & Hướng dẫn',
      onClick: () => navigate('/help'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: token.colorError }} />,
      label: <Text type="danger" strong>Đăng xuất</Text>,
      onClick: handleLogout,
    },
  ];

  const userDropdownMenu = {
    items: user?.role === 'admin' ? adminMenuItems : userMenuItems,
    style: {
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
      border: 'none',
      marginTop: token.marginXS,
      minWidth: 280,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <AntHeader 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 50%, #13c2c2 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          height: 64,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          margin: 0,
          border: 'none'
        }}
      >
        {/* Logo and Title - Fixed overflow */}
        <div
          style={{ 
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: 0,
            flex: '0 0 auto',
            maxWidth: '350px'
          }}
          onClick={() => navigate('/home')}
          className="hover-scale"
        > 
          {/* Logo */}
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Quiz document icon */}
            <div style={{
              width: '28px',
              height: '28px',
              position: 'relative'
            }}>
              {/* Document background */}
              <div style={{
                position: 'absolute',
                top: '2px',
                left: '4px',
                width: '20px',
                height: '24px',
                backgroundColor: 'white',
                borderRadius: '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}></div>
              
              {/* Document lines (quiz questions) */}
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                width: '4px',
                height: '2px',
                backgroundColor: '#667eea',
                borderRadius: '1px'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '12px',
                width: '8px',
                height: '2px',
                backgroundColor: '#e0e0e0',
                borderRadius: '1px'
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '6px',
                width: '4px',
                height: '2px',
                backgroundColor: '#52c41a',
                borderRadius: '1px'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '12px',
                width: '8px',
                height: '2px',
                backgroundColor: '#e0e0e0',
                borderRadius: '1px'
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '6px',
                width: '4px',
                height: '2px',
                backgroundColor: '#ff4d4f',
                borderRadius: '1px'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '12px',
                width: '8px',
                height: '2px',
                backgroundColor: '#e0e0e0',
                borderRadius: '1px'
              }}></div>
              
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '6px',
                width: '4px',
                height: '2px',
                backgroundColor: '#faad14',
                borderRadius: '1px'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '18px',
                left: '12px',
                width: '8px',
                height: '2px',
                backgroundColor: '#e0e0e0',
                borderRadius: '1px'
              }}></div>

              {/* Question mark overlay */}
              <div style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                width: '12px',
                height: '12px',
                backgroundColor: '#1890ff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                border: '1px solid white'
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}>?</div>
              </div>
              
              {/* Check mark for completed */}
              <div style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '10px',
                height: '10px',
                backgroundColor: '#52c41a',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid white'
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '6px',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}>✓</div>
              </div>
            </div>
            
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
              transform: 'rotate(45deg)',
              animation: 'shine 4s infinite'
            }}></div>
          </div>

          {/* Title and Subtitle */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <Title 
              level={4} 
              style={{ 
                color: 'white', 
                margin: 0, 
                fontWeight: 700,
                letterSpacing: '0.5px',
                lineHeight: '1.2',
                fontSize: '22px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              QuizPro
            </Title>
            <Text 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '11px',
                lineHeight: '1.2',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Hệ thống thi trắc nghiệm thông minh
            </Text>
          </div>
        </div>

        {/* Right Navigation - Responsive */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          flex: '0 0 auto',
          minWidth: 0
        }}>
          {user ? (
            <Space size="middle">
              {/* Notifications */}
              <Badge 
                count={unreadNotifications} 
                size="small" 
                style={{ backgroundColor: token.colorWarning }}
              >
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  size="middle"
                  style={{
                    color: 'white',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    width: '36px',
                    height: '36px'
                  }}
                  onClick={() => navigate('/notifications')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
              </Badge>

              {/* User Dropdown - Responsive */}
              <Dropdown
                menu={userDropdownMenu}
                placement="bottomRight"
                trigger={['click']}
              >
                <div
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: token.borderRadiusLG,
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: 0,
                    maxWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    icon={!user.avatar && <UserOutlined />}
                    size="default"
                    style={{
                      background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #ffa940 0%, #ff7875 100%)',
                      color: 'white',
                      boxShadow: token.boxShadow,
                      flexShrink: 0
                    }}
                  />
                  <div style={{ 
                    color: 'white', 
                    textAlign: 'left',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}>
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      fontSize: '12px',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2'
                    }}>
                      {user.email}
                    </Text>
                    {userStats.totalTests > 0 && (
                      <Text style={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        fontSize: '10px', 
                        display: 'block',
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap'
                      }}>
                        {userStats.totalTests} bài thi
                        {isStatsLoading && <Spin size="small" style={{ marginLeft: 4 }} />}
                      </Text>
                    )}
                  </div>
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space size="small">
              <Button
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                size="middle"
                style={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'transparent',
                  borderRadius: token.borderRadiusLG,
                  fontSize: '12px',
                  height: '32px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
                size="middle"
                style={{
                  background: 'linear-gradient(135deg, #ff7875 0%, #f759ab 100%)',
                  borderColor: 'transparent',
                  borderRadius: token.borderRadiusLG,
                  fontSize: '12px',
                  height: '32px',
                  boxShadow: token.boxShadow,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = token.boxShadow;
                }}
              >
                Đăng ký
              </Button>
            </Space>
          )}
        </div>
      </AntHeader>

      <style jsx global>{`
        .ant-layout-header {
          padding: 0 !important;
          line-height: 64px !important;
          height: 64px !important;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
        body {
          margin: 0;
          padding: 0;
        }
        .ant-layout {
          background: transparent;
        }
        
        /* Logo shine animation */
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          50% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
          100% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ant-layout-header {
            padding: 0 8px !important;
          }
        }
        
        @media (max-width: 576px) {
          .ant-layout-header {
            padding: 0 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;