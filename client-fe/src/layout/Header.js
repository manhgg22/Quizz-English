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
          height: 64
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
          padding: `0 ${token.paddingLG}px`,
          height: 64,
          lineHeight: '64px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          margin: 0,
          border: 'none'
        }}
      >
        {/* Logo and Title */}
        <Space 
          size="large"
          style={{ 
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            alignItems: 'center',
            height: '64px',
            lineHeight: '64px'
          }}
          onClick={() => navigate('/home')}
          className="hover-scale"
        >
          <div style={{ fontSize: 28, lineHeight: 1 }}>🦆</div>
          <div>
            <Title 
              level={4} 
              style={{ 
                color: 'white', 
                margin: 0, 
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              DuckMen Quiz
            </Title>
            <Text 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: 12
              }}
            >
              Hệ thống thi trắc nghiệm thông minh
            </Text>
          </div>
        </Space>

        {/* Right Navigation */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          height: '64px'
        }}>
          {user ? (
            <Space size="large">
              {/* Notifications */}
              <Badge 
                count={unreadNotifications} 
                size="small" 
                style={{ backgroundColor: token.colorWarning }}
              >
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  size="large"
                  style={{
                    color: 'white',
                    border: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
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

              {/* User Dropdown */}
              <Dropdown
                menu={userDropdownMenu}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space 
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: token.borderRadiusLG,
                    padding: `${token.paddingXS}px ${token.paddingSM}px`
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
                    size="large"
                    style={{
                      background: user.avatar ? 'transparent' : 'linear-gradient(135deg, #ffa940 0%, #ff7875 100%)',
                      color: 'white',
                      boxShadow: token.boxShadow
                    }}
                  />
                  <div style={{ color: 'white', textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      <Space size="small">
                        <span>{user.role === 'admin' ? '👑' : '👤'}</span>
                        <span>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                      </Space>
                    </div>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                      {user.email}
                    </Text>
                    {userStats.totalTests > 0 && (
                      <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, display: 'block' }}>
                        Đã làm {userStats.totalTests} bài thi
                        {isStatsLoading && <Spin size="small" style={{ marginLeft: 8 }} />}
                      </Text>
                    )}
                  </div>
                </Space>
              </Dropdown>
            </Space>
          ) : (
            <Space size="middle">
              <Button
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                size="large"
                style={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'transparent',
                  borderRadius: token.borderRadiusLG,
                  paddingLeft: token.paddingLG,
                  paddingRight: token.paddingLG,
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
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #ff7875 0%, #f759ab 100%)',
                  borderColor: 'transparent',
                  borderRadius: token.borderRadiusLG,
                  paddingLeft: token.paddingLG,
                  paddingRight: token.paddingLG,
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
          transform: scale(1.05);
        }
        body {
          margin: 0;
          padding: 0;
        }
        .ant-layout {
          background: transparent;
        }
      `}</style>
    </>
  );
};

export default Header;