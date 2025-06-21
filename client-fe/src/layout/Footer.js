// src/pages/Footer.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import {
  GithubOutlined,
  FacebookOutlined,
  TwitterOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HeartFilled,
  CopyrightOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '40px 0 20px 0',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 32]}>
          {/* Logo & Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '16px' }}>
              <Space align="center" style={{ marginBottom: '12px' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🦆
                </div>
                <Title level={4} style={{ color: '#fff', margin: 0 }}>
                  DuckMen Quiz
                </Title>
              </Space>
              <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block', lineHeight: '1.6' }}>
                Hệ thống thi trực tuyến hiện đại, giúp bạn học tập và kiểm tra kiến thức một cách hiệu quả.
              </Text>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '16px' }}>
              Liên kết nhanh
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link 
                href="/home" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                🏠 Trang chủ
              </Link>
              <Link 
                href="/exams" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                📝 Bài thi
              </Link>
              <Link 
                href="/user/results" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                📊 Lịch sử
              </Link>
              <Link 
                href="/help" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                ❓ Trợ giúp
              </Link>
            </div>
          </Col>

          {/* Support Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '16px' }}>
              Hỗ trợ
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link 
                href="/privacy" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                🔒 Chính sách bảo mật
              </Link>
              <Link 
                href="/terms" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                📋 Điều khoản sử dụng
              </Link>
              <Link 
                href="/contact" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                📞 Liên hệ
              </Link>
              <Link 
                href="/faq" 
                style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  transition: 'color 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
              >
                💬 Câu hỏi thường gặp
              </Link>
            </div>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={{ color: '#fff', marginBottom: '16px' }}>
              Thông tin liên hệ
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Space style={{ color: 'rgba(255,255,255,0.8)' }}>
                <EnvironmentOutlined />
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Hà Nội, Việt Nam
                </Text>
              </Space>
              <Space style={{ color: 'rgba(255,255,255,0.8)' }}>
                <PhoneOutlined />
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  +84 123 456 789
                </Text>
              </Space>
              <Space style={{ color: 'rgba(255,255,255,0.8)' }}>
                <MailOutlined />
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  contact@duckmenquiz.com
                </Text>
              </Space>
            </div>

            {/* Social Media */}
            <div style={{ marginTop: '16px' }}>
              <Title level={5} style={{ color: '#fff', marginBottom: '12px' }}>
                Theo dõi chúng tôi
              </Title>
              <Space size="middle">
                <a 
                  href="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '18px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  <FacebookOutlined />
                </a>
                <a 
                  href="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '18px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  <TwitterOutlined />
                </a>
                <a 
                  href="#" 
                  style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '18px',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  <GithubOutlined />
                </a>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider style={{ 
          borderColor: 'rgba(255,255,255,0.2)', 
          margin: '32px 0 16px 0' 
        }} />

        {/* Copyright */}
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Space style={{ color: 'rgba(255,255,255,0.8)' }}>
              <CopyrightOutlined />
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {currentYear} DuckMen và những người bạn. All rights reserved.
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space style={{ color: 'rgba(255,255,255,0.8)' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Made with
              </Text>
              <HeartFilled style={{ color: '#ff4d4f' }} />
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                in Vietnam
              </Text>
            </Space>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;