import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Dropdown, 
  Avatar, 
  Spin, 
  Badge,
  Space,
  Typography,
  Drawer,
  Divider,
  theme
} from 'antd';
import {
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  UserOutlined,
  MenuOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

const Header = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState('/home');
  const { token } = theme.useToken();
  
  // Giả lập navigation và location
  const navigate = (path) => {
    setCurrentPath(path);
    setMobileMenuVisible(false);
    console.log('Navigating to:', path);
  };

  const hideHeaderPaths = ['/login', '/register', '/forgot-password', '/welcome'];

  useEffect(() => {
    // Giả lập việc load user data
    const loadUserData = () => {
      setIsLoading(true);
      setTimeout(() => {
        // Giả lập user data
        setUser({
          id: 1,
          email: 'admin@duckmen.com',
          role: 'admin',
          name: 'Admin User',
          avatar: null
        });
        setIsLoading(false);
      }, 1000);
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
    console.log('User logged out');
  };

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  if (hideHeaderPaths.includes(currentPath)) return null;

  if (isLoading) {
    return (
      <AntHeader 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 50%, #13c2c2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <Spin 
          tip="Đang tải..." 
          size="large" 
          style={{ color: 'white' }}
        />
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
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'results',
      icon: <BarChartOutlined style={{ color: token.colorSuccess }} />,
      label: (
        <Space>
          <Text>Lịch sử kết quả</Text>
          <Badge count={5} size="small" style={{ backgroundColor: token.colorSuccess }} />
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
          <Badge count={3} size="small" style={{ backgroundColor: token.colorSuccess }} />
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
      minWidth: 240,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }
  };

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
        {/* Logo và Title */}
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
                fontSize: 12,
                display: window.innerWidth < 640 ? 'none' : 'block'
              }}
            >
              Hệ thống thi trắc nghiệm thông minh
            </Text>
          </div>
        </Space>

        {/* Desktop Navigation */}
        <div style={{ 
          display: window.innerWidth < 768 ? 'none' : 'flex',
          alignItems: 'center',
          height: '64px'
        }}>
          {user ? (
            <Space size="large">
              {/* Notifications */}
              <Badge count={2} size="small" style={{ backgroundColor: token.colorWarning }}>
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
                    icon={<UserOutlined />}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #ffa940 0%, #ff7875 100%)',
                      color: 'white',
                      boxShadow: token.boxShadow
                    }}
                  />
                  <div style={{ color: 'white', textAlign: 'left', display: window.innerWidth < 1024 ? 'none' : 'block' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      <Space size="small">
                        <span>{user.role === 'admin' ? '👑' : '👤'}</span>
                        <span>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                      </Space>
                    </div>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                      {user.email}
                    </Text>
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

        {/* Mobile Menu Button */}
        <div style={{ 
          display: window.innerWidth >= 768 ? 'none' : 'flex',
          alignItems: 'center',
          height: '64px'
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleMobileMenu}
            size="large"
            style={{
              color: 'white',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
          />
        </div>
      </AntHeader>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Space size="middle">
            <span style={{ fontSize: 24 }}>🦆</span>
            <Title level={4} style={{ margin: 0 }}>DuckMen Quiz</Title>
          </Space>
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={300}
        style={{ display: window.innerWidth >= 768 ? 'none' : 'block' }}
        styles={{
          body: { padding: token.paddingLG }
        }}
      >
        {user ? (
          <div>
            {/* User Info Card */}
            <div style={{
              background: 'linear-gradient(135deg, #e6f7ff 0%, #f9f0ff 100%)',
              borderRadius: token.borderRadiusLG,
              padding: token.paddingLG,
              marginBottom: token.marginLG,
              border: `1px solid ${token.colorBorder}`
            }}>
              <Space size="middle">
                <Avatar
                  icon={<UserOutlined />}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #ffa940 0%, #ff7875 100%)',
                    color: 'white'
                  }}
                />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    <Space size="small">
                      <span>{user.role === 'admin' ? '👑' : '👤'}</span>
                      <span>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                    </Space>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.email}
                  </Text>
                </div>
              </Space>
            </div>

            <Divider style={{ margin: `${token.marginLG}px 0` }} />

            {/* Menu Items */}
            <Menu
              mode="vertical"
              style={{ 
                border: 'none',
                backgroundColor: 'transparent'
              }}
              items={user.role === 'admin' ? adminMenuItems : userMenuItems}
            />
          </div>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              size="large"
              style={{ 
                width: '100%',
                borderRadius: token.borderRadiusLG,
                height: 48
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
                width: '100%',
                background: 'linear-gradient(135deg, #ff7875 0%, #f759ab 100%)',
                borderColor: 'transparent',
                borderRadius: token.borderRadiusLG,
                height: 48
              }}
            >
              Đăng ký
            </Button>
          </Space>
        )}
      </Drawer>

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