import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  message,
  Row,
  Col,
  Checkbox
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import axios from '../api/axiosInstance';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setIsLoading(true);
    
    try {
      const res = await axios.post('/auth/register', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Chuyển hướng về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      message.error(err.response?.data?.msg || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Redirect to Google OAuth
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
    } catch (err) {
      message.error('Không thể kết nối với Google');
      setIsGoogleLoading(false);
    }
  };

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
          maxWidth: '450px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Đăng ký
          </Title>
          <Text type="secondary">
            Tạo tài khoản mới để bắt đầu!
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' },
              { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Họ và tên"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Số điện thoại"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
              }
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              style={{ borderRadius: '8px' }}
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản!')),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý với{' '}
              <Link to="/terms" style={{ color: '#1890ff' }}>
                Điều khoản sử dụng
              </Link>
              {' '}và{' '}
              <Link to="/privacy" style={{ color: '#1890ff' }}>
                Chính sách bảo mật
              </Link>
            </Checkbox>
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
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Hoặc</Text>
        </Divider>

        <Button
          icon={<GoogleOutlined />}
          onClick={handleGoogleRegister}
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
          {isGoogleLoading ? 'Đang kết nối...' : 'Đăng ký với Google'}
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Đã có tài khoản?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#1890ff', 
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;