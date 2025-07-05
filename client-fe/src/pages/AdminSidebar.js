// src/components/AdminSidebar.js
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Typography, Badge, Divider, Button, Space, Tooltip, Modal } from 'antd';
import {
  DashboardOutlined,
  PlusCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TagOutlined,
  DownloadOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;
const { Title, Text } = Typography;

const AdminSidebar = ({ selectedKey, setSelectedKey }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    {
      key: 'home',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      badge: null
    },
    {
      key: 'classes',
      icon: <TeamOutlined />,
      label: 'Quản lý lớp học',
      badge: null
    },
    {
      key: 'exams',
      icon: <FileTextOutlined />,
      label: 'Câu hỏi ôn tập',
      badge: null
    },
    {
      key: 'practice-results',
      icon: <BarChartOutlined />,
      label: 'Xem điểm số',
      badge: null
    },
    {
      key: 'topics',
      icon: <TagOutlined />,
      label: 'Quản lý chủ đề',
      badge: null
    },
    {
      key: '/user/results',
      icon: <TrophyOutlined />,
      label: 'Lịch sử kết quả',
   
    }
    ,

    
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    if (e.key.startsWith('/')) {
      // Nếu là path tuyệt đối (ví dụ /user/results)
      navigate(e.key);
    } else {
      // Nếu là key bình thường (ví dụ home, topics, ...)
      navigate(`/admin/${e.key}`);
    }
  };


  const handleLogout = () => {
    Modal.confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: () => {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  const renderMenuItem = (item) => {
    const menuItem = {
      ...item,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{item.label}</span>
          {item.badge && (
            <Badge
              count={item.badge}
              style={{
                backgroundColor: item.badge === 'new' ? '#52c41a' : '#ff4d4f',
                fontSize: '10px',
                height: '16px',
                lineHeight: '16px',
                minWidth: '16px'
              }}
            />
          )}
        </div>
      ),
      style: {
        borderRadius: 8,
        margin: '4px 0',
        height: 44,
        display: 'flex',
        alignItems: 'center'
      }
    };
    return menuItem;
  };

  return (
    <Sider
      width={collapsed ? 80 : 280}
      collapsed={collapsed}
      style={{
        background: 'linear-gradient(145deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Toggle Button */}
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: 'none'
        }}
      />

      {/* Header */}
      <div style={{
        padding: collapsed ? '16px 8px' : '24px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      }}>
        <Avatar size={collapsed ? 40 : 72} style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          border: '3px solid rgba(255,255,255,0.2)'
        }}>
          <UserOutlined style={{ fontSize: collapsed ? 18 : 32 }} />
        </Avatar>

        {!collapsed && (
          <>
            <Title level={4} style={{ color: 'white', marginTop: 16, marginBottom: 6 }}>
              Admin Dashboard
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
              Phiên bản 2.0
            </Text>
          </>
        )}
      </div>

      {/* Time & Notifications */}
      {!collapsed && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)'
        }}>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <ClockCircleOutlined style={{ color: '#60a5fa' }} />
                <Text style={{ color: 'white', fontSize: '12px' }}>
                  {currentTime.toLocaleTimeString('vi-VN')}
                </Text>
              </Space>
           
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
              {currentTime.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </Space>
        </div>
      )}

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: 16,
          paddingInline: 8,
          flex: 1
        }}
        items={menuItems.map(item => renderMenuItem(item))}
      />



      {/* Footer Actions */}
      <div style={{
        padding: collapsed ? '8px' : '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.1)'
      }}>
        {collapsed ? (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Tooltip title="Trợ giúp" placement="right">
  <Button
    type="text"
    icon={<QuestionCircleOutlined />}
    onClick={() => navigate('/help')}
    style={{ color: 'rgba(255,255,255,0.8)', width: '100%' }}
  />
</Tooltip>

            <Tooltip title="Đăng xuất" placement="right">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: '#ff4d4f', width: '100%' }}
              />
            </Tooltip>
          </Space>
        ) : (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              style={{ color: 'rgba(255,255,255,0.8)', width: '100%', textAlign: 'left' }}
               onClick={() => navigate('/help')}
            >
              Trợ giúp & Hỗ trợ
            </Button>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ color: '#ff4d4f', width: '100%', textAlign: 'left' }}
            >
              Đăng xuất
            </Button>
          </Space>
        )}
      </div>
    </Sider>
  );
};

export default AdminSidebar;