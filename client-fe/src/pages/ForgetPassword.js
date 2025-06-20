import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Result,
  Steps
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import axios from '../api/axiosInstance';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  // Bước 1: Gửi email reset
  const handleSendResetEmail = async (values) => {
    setIsLoading(true);
    
    try {
      await axios.post('/auth/forgot-password', {
        email: values.email
      });
      
      setEmail(values.email);
      setCurrentStep(1);
      message.success('Email đặt lại mật khẩu đã được gửi!');
      
    } catch (err) {
      message.error(err.response?.data?.msg || 'Gửi email thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác thực token và đặt lại mật khẩu
  const handleResetPassword = async (values) => {
    setIsLoading(true);
    
    try {
      await axios.post('/auth/reset-password', {
        email: email,
        token: values.token,
        newPassword: values.newPassword
      });
      
      setResetToken(values.token);
      setCurrentStep(2);
      message.success('Đặt lại mật khẩu thành công!');
      
    } catch (err) {
      message.error(err.response?.data?.msg || 'Đặt lại mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại email
  const handleResendEmail = async () => {
    setIsLoading(true);
    
    try {
      await axios.post('/auth/forgot-password', { email });
      message.success('Email đã được gửi lại!');
    } catch (err) {
      message.error('Gửi lại email thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                Quên mật khẩu
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu
              </Paragraph>
            </div>

            <Form
              form={form}
              name="forgot-password"
              onFinish={handleSendResetEmail}
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
                  prefix={<MailOutlined />}
                  placeholder="Nhập email của bạn"
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
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
                  {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại'}
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 1:
        return (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
                Kiểm tra email
              </Title>
              <Paragraph type="secondary">
                Chúng tôi đã gửi mã xác thực đến email:
              </Paragraph>
              <Text strong style={{ color: '#1890ff' }}>{email}</Text>
              <Paragraph type="secondary" style={{ marginTop: '16px' }}>
                Vui lòng kiểm tra email và nhập mã xác thực cùng mật khẩu mới
              </Paragraph>
            </div>

            <Form
              form={resetForm}
              name="reset-password"
              onFinish={handleResetPassword}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="token"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã xác thực!' },
                  { len: 6, message: 'Mã xác thực phải có 6 ký tự!' }
                ]}
              >
                <Input
                  placeholder="Nhập mã xác thực 6 số"
                  size="large"
                  style={{ 
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '18px',
                    letterSpacing: '2px'
                  }}
                  maxLength={6}
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!'
                  }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu mới"
                  size="large"
                  style={{ borderRadius: '8px' }}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
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
                  style={{ borderRadius: '8px' }}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
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
                  {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text type="secondary">Không nhận được email? </Text>
              <Button 
                type="link" 
                onClick={handleResendEmail}
                loading={isLoading}
                style={{ padding: 0, height: 'auto' }}
              >
                Gửi lại
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Đặt lại mật khẩu thành công!"
            subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới."
            extra={[
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/login')}
                style={{ borderRadius: '8px' }}
              >
                Đăng nhập ngay
              </Button>
            ]}
          />
        );

      default:
        return null;
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
        {currentStep < 2 && (
          <div style={{ marginBottom: '30px' }}>
            <Steps current={currentStep} size="small">
              <Step title="Nhập email" />
              <Step title="Xác thực" />
              <Step title="Hoàn thành" />
            </Steps>
          </div>
        )}

        {renderStepContent()}

        {currentStep < 2 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/login')}
              style={{ padding: 0, height: 'auto' }}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;