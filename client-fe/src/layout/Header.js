import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [userStats, setUserStats] = useState({ totalTests: 0, pendingResults: 0 });
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  
  const API_BASE = 'http://localhost:3001/api';
  const hideHeaderPaths = ['/login', '/register', '/forgot-password', '/welcome'];

  // Load user data
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
          loadUserData(user.id, token);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // THÊM: Lắng nghe sự kiện đăng nhập
  useEffect(() => {
    const handleLoginSuccess = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        setUser(user);
        loadUserData(user.id, token);
      }
    };

    // Lắng nghe sự kiện đăng nhập
    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    // Cleanup
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  const loadUserData = async (userId, token) => {
    try {
      const [statsRes, notifsRes] = await Promise.all([
        fetch(`${API_BASE}/users/${userId}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/users/${userId}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUserStats({ 
          totalTests: stats.totalTests || 0,
          pendingResults: stats.pendingResults || 0 
        });
      }

      if (notifsRes.ok) {
        const notifs = await notifsRes.json();
        setNotifications(notifs || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    setUserStats({ totalTests: 0, pendingResults: 0 });
    navigate('/login');
    message.success('Đăng xuất thành công');
  };

  // Sử dụng location.pathname thay vì state
  if (hideHeaderPaths.includes(location.pathname)) return null;

  if (isLoading) {
    return (
      <AntHeader 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 50%, #13c2c2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 64
        }}
      >
        <Spin size="small" />
      </AntHeader>
    );
  }

  const menuItems = [
   
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ',
      onClick: () => navigate('/home'),
    },
    ...(user?.role === 'admin' ? [{
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    }] : []),
     {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'results',
      icon: <BarChartOutlined />,
      label: 'Lịch sử kết quả',
      onClick: () => navigate('/user/results'),
    },
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('/admin'),
    }] : []),
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Trợ giúp',
      onClick: () => navigate('/help'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <Text type="danger">Đăng xuất</Text>,
      onClick: handleLogout,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
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
        zIndex: 1000
      }}
    >
      {/* Logo */}
      <div
        style={{ 
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
        onClick={() => navigate('/home')}
      > 
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          Q
        </div>
        <div>
          <Title 
            level={4} 
            style={{ 
              color: 'white', 
              margin: 0, 
              fontWeight: 700,
              fontSize: '20px'
            }}
          >
            QuizPro
          </Title>
          <Text 
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '12px',
              display: 'block'
            }}
          >
            Hệ thống thi trắc nghiệm
          </Text>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <Space size="middle">
            {/* Notifications */}
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none'
                }}
                onClick={() => navigate('/notifications')}
              />
            </Badge>

            {/* User Menu */}
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div
                style={{
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Avatar
                  src={user.avatar}
                  icon={!user.avatar && <UserOutlined />}
                  size="small"
                />
                <div style={{ color: 'white' }}>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: '12px',
                    display: 'block'
                  }}>
                    {user.email}
                  </Text>
                  {userStats.totalTests > 0 && (
                    <Text style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: '10px'
                    }}>
                      {userStats.totalTests} bài thi
                    </Text>
                  )}
                </div>
              </div>
            </Dropdown>
          </Space>
        ) : (
          <Space>
            <Button
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'transparent'
              }}
            >
              Đăng nhập
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #ff7875 0%, #f759ab 100%)',
                borderColor: 'transparent'
              }}
            >
              Đăng ký
            </Button>
          </Space>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;