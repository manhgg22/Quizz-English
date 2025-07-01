import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  Space,
  message,
  Checkbox,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import axios from '../api/axiosInstance';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Kiểm tra nếu đã login thì chuyển hướng
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userObj = JSON.parse(user);
      if (userObj.role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleLogin = async (values) => {
    setIsLoading(true);
    
    try {
      const res = await axios.post('/auth/login', {
        email: values.email,
        password: values.password
      });
      
      const { token, user } = res.data;
      
      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('loginSuccess'));

      
      // Lưu remember me
      if (values.remember) {
        localStorage.setItem('remember_email', values.email);
      } else {
        localStorage.removeItem('remember_email');
      }
      
      message.success('Đăng nhập thành công!');
      
      // Chuyển hướng
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin/home');
        } else {
          navigate('/home');
        }
      }, 1000);
      
    } catch (err) {
      message.error(err.response?.data?.msg || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Redirect to Google OAuth
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    } catch (err) {
      message.error('Không thể kết nối với Google');
      setIsGoogleLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      form.setFieldsValue({
        email: rememberedEmail,
        remember: true
      });
    }
  }, [form]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Đăng nhập
          </Title>
          <Text type="secondary">
            Chào mừng bạn quay trở lại!
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              style={{ borderRadius: '8px' }}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <Link 
                  to="/forgot-password" 
                  style={{ color: '#1890ff', textDecoration: 'none' }}
                >
                  Quên mật khẩu?
                </Link>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              block
              style={{
                borderRadius: '8px',
                height: '45px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Button
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={isGoogleLoading}
          size="large"
          block
          style={{
            borderRadius: '8px',
            height: '45px',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '20px',
            borderColor: '#db4437',
            color: '#db4437'
          }}
        >
          {isGoogleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Chưa có tài khoản?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#1890ff', 
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Đăng ký ngay
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;