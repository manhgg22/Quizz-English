import React, { useState, useEffect, useCallback } from 'react';
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
  message,
  List 
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  
  const API_BASE = 'http://localhost:9999/api';
  const hideHeaderPaths = ['/login', '/register', '/forgot-password', '/welcome'];

  // Load user data with error handling
  const loadUserData = useCallback(async (userId, token) => {
    try {
      const [statsRes, notifsRes] = await Promise.all([
        fetch(`${API_BASE}/users/${userId}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/notifications/${userId}`, {
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
        // Kiểm tra cấu trúc dữ liệu và đảm bảo luôn có array
        const notificationData = notifs?.data || notifs || [];
        setNotifications(Array.isArray(notificationData) ? notificationData : []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setNotifications([]); // Reset về array rỗng khi có lỗi
    }
  }, [API_BASE]);

  // Refresh notifications function
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/notifications/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const notifs = await response.json();
        const notificationData = notifs?.data || notifs || [];
        setNotifications(Array.isArray(notificationData) ? notificationData : []);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [user, API_BASE]);

  // Load user on component mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
          loadUserData(user._id, token);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [loadUserData]);

  // Listen for login success events
  useEffect(() => {
    const handleLoginSuccess = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          loadUserData(user._id, token);
        } catch (error) {
          console.error('Error handling login success:', error);
        }
      }
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [loadUserData]);




  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 3000); 

    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  // Handle marking all notifications as read
  const handleMarkAllRead = async () => {
    if (!user || isMarkingAllRead) return;
    
    setIsMarkingAllRead(true);
    try {
      const response = await fetch(`${API_BASE}/notifications/${user._id}/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        message.success('Đã đánh dấu tất cả là đã đọc');
      } else {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('❌ Lỗi khi mark all read:', error);
      message.error('Không thể đánh dấu tất cả');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Handle individual notification click
  const handleNotificationClick = async (item) => {
    if (!item) return;

    try {
      // Điều hướng theo loại
      if (item.type === 'exam' && item.linkId) {
        navigate(`/exam/${item.linkId}`);
      } else if (item.type === 'result' && item.linkId) {
        navigate(`/user/results/${item.linkId}`);
      }

      // Đánh dấu là đã đọc nếu chưa đọc
      if (!item.read) {
        const response = await fetch(`${API_BASE}/notifications/${item._id}/mark-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setNotifications(prev =>
            prev.map(n => n._id === item._id ? { ...n, read: true } : n)
          );
        }
      }

      // Đóng dropdown
      setNotificationOpen(false);
    } catch (error) {
      console.error('❌ Lỗi khi xử lý notification click:', error);
    }
  };

  // Notification dropdown configuration
  const notificationDropdown = {
    items: [
      {
        key: 'notifications',
        label: (
          <div style={{ maxHeight: 400, overflowY: 'auto', minWidth: 320 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: '8px'
            }}>
              <Text strong style={{ fontSize: '14px' }}>
                Thông báo ({notifications.length})
              </Text>
              <div style={{ display: 'flex', gap: '8px' }}>
                {notifications.some(n => !n.read) && (
                  <Button
                    type="link"
                    size="small"
                    loading={isMarkingAllRead}
                    onClick={handleMarkAllRead}
                    style={{ fontSize: '12px', padding: 0 }}
                  >
                    Đánh dấu tất cả
                  </Button>
                )}
                <Button
                  type="link"
                  size="small"
                  onClick={refreshNotifications}
                  style={{ fontSize: '12px', padding: 0 }}
                >
                  🔄 Làm mới
                </Button>
              </div>
            </div>
            
            <List
              dataSource={notifications}
              locale={{ emptyText: 'Không có thông báo nào' }}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    background: item.read ? '#fff' : '#e6f7ff',
                    padding: '12px',
                    cursor: 'pointer',
                    margin: '4px 0',
                    borderRadius: '6px',
                    border: item.read ? '1px solid #f0f0f0' : '1px solid #91d5ff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = item.read ? '#f8f9fa' : '#bae7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = item.read ? '#fff' : '#e6f7ff';
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!item.read && (
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#1890ff',
                            borderRadius: '50%'
                          }} />
                        )}
                        <Text strong style={{ fontSize: '13px' }}>
                          {item.title || 'Thông báo'}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                          {item.message || 'Không có nội dung'}
                        </Text>
                        {item.createdAt && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {new Date(item.createdAt).toLocaleString('vi-VN')}
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        ),
      },
    ],
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

  // Hide header on certain paths
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
            <Dropdown
              menu={notificationDropdown}
              trigger={['click']}
              open={notificationOpen}
              onOpenChange={(visible) => setNotificationOpen(visible)}
              placement="bottomRight"
              arrow
            >
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                />
              </Badge>
            </Dropdown>

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