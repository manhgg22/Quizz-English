import React, { useState } from 'react';
import { 
  Layout, 
  Typography, 
  Collapse, 
  Card, 
  Steps, 
  Button, 
  Space, 
  Input, 
  Row, 
  Col,
  Divider,
  Tag,
  Alert,
  Avatar,
  Rate,
  message
} from 'antd';
import {
  QuestionCircleOutlined,
  BookOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  UserOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  BugOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;
const { Search } = Input;

const Help = () => {
  const [activeKey, setActiveKey] = useState(['1']);
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      key: '1',
      title: 'Làm thế nào để đăng ký tài khoản?',
      content: (
        <div>
          <Steps direction="vertical" size="small">
            <Step 
              title="Truy cập trang đăng ký" 
              description="Nhấn nút 'Đăng ký' ở góc phải màn hình"
              icon={<UserOutlined />}
            />
            <Step 
              title="Điền thông tin" 
              description="Nhập email, mật khẩu và xác nhận mật khẩu"
              icon={<FileTextOutlined />}
            />
            <Step 
              title="Xác thực email" 
              description="Kiểm tra email và nhấn link xác thực"
              icon={<MailOutlined />}
            />
            <Step 
              title="Hoàn thành" 
              description="Đăng nhập và bắt đầu sử dụng"
              icon={<CheckCircleOutlined />}
            />
          </Steps>
        </div>
      )
    },
    {
      key: '2',
      title: 'Cách tham gia một bài thi?',
      content: (
        <div>
          <Paragraph>
            <Text strong>Bước 1:</Text> Đăng nhập vào tài khoản của bạn
          </Paragraph>
          <Paragraph>
            <Text strong>Bước 2:</Text> Vào trang chủ, chọn bài thi bạn muốn tham gia
          </Paragraph>
          <Paragraph>
            <Text strong>Bước 3:</Text> Đọc kỹ hướng dẫn và quy định
          </Paragraph>
          <Paragraph>
            <Text strong>Bước 4:</Text> Nhấn "Bắt đầu thi" và làm bài trong thời gian quy định
          </Paragraph>
          <Alert 
            message="Lưu ý quan trọng" 
            description="Một khi bắt đầu, bạn không thể tạm dừng. Hãy chuẩn bị kỹ trước khi nhấn 'Bắt đầu'!"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      )
    },
    {
      key: '3',
      title: 'Làm sao để xem kết quả thi?',
      content: (
        <div>
          <Paragraph>
            Sau khi hoàn thành bài thi, bạn có thể xem kết quả theo các cách sau:
          </Paragraph>
          <ul>
            <li>Kết quả tức thì hiển thị ngay sau khi nộp bài</li>
            <li>Vào mục "Lịch sử kết quả" để xem chi tiết</li>
            <li>Nhận thông báo qua email về kết quả</li>
          </ul>
          <Tag color="green">Điểm số</Tag>
          <Tag color="blue">Thời gian hoàn thành</Tag>
          <Tag color="orange">Xếp hạng</Tag>
          <Tag color="purple">Phân tích chi tiết</Tag>
        </div>
      )
    },
    {
      key: '4',
      title: 'Tôi quên mật khẩu, phải làm sao?',
      content: (
        <div>
          <Steps direction="vertical" size="small">
            <Step 
              title="Vào trang đăng nhập" 
              description="Nhấn 'Quên mật khẩu?' dưới form đăng nhập"
            />
            <Step 
              title="Nhập email" 
              description="Điền email đã đăng ký tài khoản"
            />
            <Step 
              title="Kiểm tra email" 
              description="Mở email và nhấn link đặt lại mật khẩu"
            />
            <Step 
              title="Tạo mật khẩu mới" 
              description="Nhập mật khẩu mới và xác nhận"
            />
          </Steps>
        </div>
      )
    },
    {
      key: '5',
      title: 'Hệ thống có hỗ trợ mobile không?',
      content: (
        <div>
          <Alert 
            message="Hoàn toàn hỗ trợ!" 
            description="QuizPro được tối ưu cho mọi thiết bị"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="📱 Mobile">
                <p>iOS & Android</p>
                <p>Responsive design</p>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="💻 Tablet">
                <p>iPad & Android tablet</p>
                <p>Touch friendly</p>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="🖥️ Desktop">
                <p>Windows, Mac, Linux</p>
                <p>All browsers</p>
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '6',
      title: 'Quy định về thời gian làm bài?',
      content: (
        <div>
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>⏰ Thời gian chuẩn:</Text>
                <ul>
                  <li>Trắc nghiệm: 60-90 phút</li>
                  <li>Tự luận: 120-180 phút</li>
                  <li>Thực hành: 240 phút</li>
                </ul>
              </Col>
              <Col span={12}>
                <Text strong>📋 Lưu ý:</Text>
                <ul>
                  <li>Đếm ngược thời gian real-time</li>
                  <li>Tự động nộp khi hết giờ</li>
                  <li>Cảnh báo 10 phút cuối</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </div>
      )
    }
  ];

  const quickGuides = [
    {
      icon: <PlayCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Bắt đầu làm bài thi',
      description: 'Hướng dẫn từng bước để tham gia bài thi đầu tiên',
      link: '#start-exam'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'Xem kết quả và thống kê',
      description: 'Cách xem điểm số, xếp hạng và phân tích kết quả chi tiết',
      link: '#view-results'
    },
    {
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      title: 'Cài đặt tài khoản',
      description: 'Tùy chỉnh thông tin cá nhân, mật khẩu và preferences',
      link: '#account-settings'
    },
    {
      icon: <BugOutlined style={{ fontSize: '24px', color: '#f5222d' }} />,
      title: 'Báo cáo lỗi',
      description: 'Hướng dẫn báo cáo lỗi kỹ thuật và vấn đề hệ thống',
      link: '#report-bug'
    }
  ];

  const supportTeam = [
    {
      name: 'Nguyễn Văn An',
      role: 'Technical Support Lead',
      avatar: null,
      rating: 4.9,
      responseTime: '< 2 giờ'
    },
    {
      name: 'Trần Thị Bình',
      role: 'Customer Success Manager',
      avatar: null,
      rating: 4.8,
      responseTime: '< 1 giờ'
    },
    {
      name: 'Lê Văn Cường',
      role: 'Product Specialist',
      avatar: null,
      rating: 4.9,
      responseTime: '< 3 giờ'
    }
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Logic tìm kiếm FAQ
    message.info(`Đang tìm kiếm: "${value}"`);
  };

  const handleContactSupport = () => {
    message.success('Đã gửi yêu cầu hỗ trợ. Chúng tôi sẽ liên hệ với bạn sớm nhất!');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '48px 24px',
          color: 'white'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
            <QuestionCircleOutlined style={{ marginRight: '12px' }} />
            Trung tâm Trợ giúp
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Chúng tôi ở đây để giúp bạn. Tìm câu trả lời nhanh chóng hoặc liên hệ với đội ngũ hỗ trợ.
          </Paragraph>
          
          {/* Search Bar */}
          <div style={{ maxWidth: '500px', margin: '32px auto 0' }}>
            <Search
              placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Quick Guides */}
          <Col span={24}>
            <Card>
              <Title level={3}>
                <BookOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Hướng dẫn nhanh
              </Title>
              <Row gutter={[16, 16]}>
                {quickGuides.map((guide, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card 
                      hoverable
                      style={{ height: '100%' }}
                      bodyStyle={{ padding: '20px' }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        {guide.icon}
                      </div>
                      <Title level={5} style={{ textAlign: 'center', marginBottom: '8px' }}>
                        {guide.title}
                      </Title>
                      <Paragraph style={{ 
                        textAlign: 'center', 
                        color: '#666',
                        fontSize: '14px',
                        marginBottom: '16px'
                      }}>
                        {guide.description}
                      </Paragraph>
                      <Button 
                        type="primary" 
                        block 
                        ghost
                        onClick={() => message.info('Đang mở hướng dẫn...')}
                      >
                        Xem hướng dẫn
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* FAQ Section */}
          <Col xs={24} lg={16}>
            <Card>
              <Title level={3}>
                <QuestionCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Câu hỏi thường gặp
              </Title>
              <Collapse 
                activeKey={activeKey}
                onChange={setActiveKey}
                expandIconPosition="end"
                ghost
              >
                {faqData.map(faq => (
                  <Panel 
                    header={
                      <Text strong style={{ fontSize: '16px' }}>
                        {faq.title}
                      </Text>
                    } 
                    key={faq.key}
                    style={{ 
                      marginBottom: '8px',
                      background: activeKey.includes(faq.key) ? '#f6ffed' : 'white',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9'
                    }}
                  >
                    {faq.content}
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>

          {/* Contact Support */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Contact Info */}
              <Card>
                <Title level={4}>
                  <CustomerServiceOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  Liên hệ hỗ trợ
                </Title>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                    <Space>
                      <PhoneOutlined style={{ color: '#1890ff' }} />
                      <div>
                        <Text strong>Hotline:</Text>
                        <br />
                        <Text copyable>+84 123 456 789</Text>
                      </div>
                    </Space>
                  </div>
                  
                  <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                    <Space>
                      <MailOutlined style={{ color: '#52c41a' }} />
                      <div>
                        <Text strong>Email:</Text>
                        <br />
                        <Text copyable>contact@duckmenquiz.com</Text>
                      </div>
                    </Space>
                  </div>

                  <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: '8px' }}>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <div>
                        <Text strong>Thời gian hỗ trợ:</Text>
                        <br />
                        <Text>8:00 - 22:00 (T2-CN)</Text>
                      </div>
                    </Space>
                  </div>
                </Space>

                <Button 
                  type="primary" 
                  block 
                  style={{ marginTop: '16px' }}
                  onClick={handleContactSupport}
                >
                  Gửi yêu cầu hỗ trợ
                </Button>
              </Card>

              {/* Support Team */}
              <Card>
                <Title level={4}>
                  <HeartOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                  Đội ngũ hỗ trợ
                </Title>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  {supportTeam.map((member, index) => (
                    <div key={index} style={{ 
                      padding: '12px', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '8px',
                      background: 'white'
                    }}>
                      <Space align="start">
                        <Avatar icon={<UserOutlined />} />
                        <div style={{ flex: 1 }}>
                          <Text strong>{member.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {member.role}
                          </Text>
                          <br />
                          <Space size="small" style={{ marginTop: '4px' }}>
                            <Rate disabled value={member.rating} style={{ fontSize: '12px' }} />
                            <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                              {member.responseTime}
                            </Text>
                          </Space>
                        </div>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* Quick Stats */}
              <Card>
                <Title level={4}>
                  <StarOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                  Thống kê hỗ trợ
                </Title>
                
                <Row gutter={8}>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                        98%
                      </Title>
                      <Text type="secondary">Độ hài lòng</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: 'center', padding: '12px' }}>
                      <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                        
                      </Title>
                      <Text type="secondary">Thời gian phản hồi</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Bottom CTA */}
        <Card style={{ marginTop: '32px', textAlign: 'center' }}>
          <Title level={3}>Vẫn cần trợ giúp?</Title>
          <Paragraph>
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
          </Paragraph>
          <Space size="middle">
            <Button type="primary" size="large" icon={<CustomerServiceOutlined />}>
              Chat trực tiếp
            </Button>
            <Button size="large" icon={<VideoCameraOutlined />}>
              Đặt lịch video call
            </Button>
            <Button size="large" icon={<MailOutlined />}>
              Gửi ticket
            </Button>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default Help;