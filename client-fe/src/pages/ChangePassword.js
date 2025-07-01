import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  message,
  Progress
} from 'antd';
import {
  LockOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  
  const API_BASE = 'http://localhost:9999/api';

  // Validate password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    setPasswordStrength((strength / 5) * 100);
    return strength;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return { text: 'Yếu', color: '#ff4d4f' };
    if (passwordStrength < 80) return { text: 'Trung bình', color: '#faad14' };
    return { text: 'Mạnh', color: '#52c41a' };
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        message.error('Phiên đăng nhập đã hết hạn');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);

      const response = await fetch(`${API_BASE}/users/${user._id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });

      if (response.ok) {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields();
        setPasswordStrength(0);
        
        // Optional: Auto logout and redirect to login
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        const error = await response.json();
        message.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        const strength = checkPasswordStrength(value);
        if (strength < 3) {
          return Promise.reject(new Error('Mật khẩu quá yếu! Vui lòng sử dụng kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.'));
        }
        return Promise.resolve();
      }
    }
  ];

  const strengthInfo = getPasswordStrengthText();

  return (
    <Layout>
      <Content style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              style={{ marginBottom: '16px' }}
            >
              Quay lại
            </Button>
            <Title level={2}>Đổi mật khẩu</Title>
            <Text type="secondary">
              Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia sẻ với người khác.
            </Text>
          </div>

          {/* Change Password Form */}
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu hiện tại"
                  size="large"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={passwordRules}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu mới"
                  size="large"
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              {/* Password Strength Indicator */}
              {passwordStrength > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Độ mạnh mật khẩu:</Text>
                    <Text style={{ color: strengthInfo.color, fontWeight: 'bold' }}>
                      {strengthInfo.text}
                    </Text>
                  </div>
                  <Progress 
                    percent={passwordStrength} 
                    strokeColor={strengthInfo.color}
                    showInfo={false}
                    size="small"
                  />
                </div>
              )}

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              {/* Password Requirements */}
              <Card 
                size="small" 
                title="Yêu cầu mật khẩu" 
                style={{ marginBottom: '24px', backgroundColor: '#fafafa' }}
              >
                <Space direction="vertical" size="small">
                  <div>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>Ít nhất 8 ký tự</Text>
                  </div>
                                   <div>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>Có chữ hoa và chữ thường</Text>
                  </div>
                  <div>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>Có ít nhất một số</Text>
                  </div>
                  <div>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>Có ký tự đặc biệt (!@#$...)</Text>
                  </div>
                </Space>
              </Card>

              {/* Submit Button */}
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  size="large" 
                  loading={loading}
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ChangePassword;
