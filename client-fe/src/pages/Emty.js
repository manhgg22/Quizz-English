import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Button, 
  Row, 
  Col, 
  Card, 
  Typography, 
  Space, 
  Avatar, 
  Statistic, 
  Timeline,
  Tabs,
  Badge,
  Divider,
  Form,
  Input,
  Modal
} from 'antd';
import {
  PlayCircleOutlined,
  UserOutlined,
  SettingOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ArrowRightOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const Emty = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [showDemo, setShowDemo] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    quizzes: 0,
    questions: 0,
    completed: 0
  });

  // Animation cho statistics
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        users: 15420,
        quizzes: 2340,
        questions: 45680,
        completed: 128950
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: <SettingOutlined className="text-4xl text-blue-500" />,
      title: "Quản lý Admin Mạnh mẽ",
      description: "Tạo và quản lý câu hỏi dễ dàng, phân quyền người dùng linh hoạt với giao diện trực quan"
    },
    {
      icon: <UserOutlined className="text-4xl text-green-500" />,
      title: "Trải nghiệm User Tuyệt vời",
      description: "Giao diện thân thiện, làm quiz mượt mà với nhiều định dạng câu hỏi đa dạng"
    },
    {
      icon: <BarChartOutlined className="text-4xl text-purple-500" />,
      title: "Thống kê Chi tiết",
      description: "Báo cáo real-time, phân tích kết quả chi tiết giúp theo dõi tiến độ học tập"
    },
    {
      icon: <SafetyOutlined className="text-4xl text-red-500" />,
      title: "Bảo mật Cao",
      description: "Hệ thống bảo mật đa lớp, mã hóa dữ liệu đảm bảo thông tin luôn an toàn"
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-yellow-500" />,
      title: "Hiệu suất Cao",
      description: "Tối ưu hóa tốc độ, xử lý hàng nghìn user đồng thời không lag"
    },
    {
      icon: <TeamOutlined className="text-4xl text-indigo-500" />,
      title: "Hỗ trợ Đa người dùng",
      description: "Hỗ trợ nhiều tổ chức, phòng ban với system phân quyền linh hoạt"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Hoàn hảo cho cá nhân",
      features: [
        "Tối đa 50 câu hỏi",
        "5 quiz cùng lúc",
        "Báo cáo cơ bản",
        "Hỗ trợ email"
      ],
      popular: false,
      buttonText: "Dùng thử miễn phí"
    },
    {
      name: "Professional",
      price: "299,000đ/tháng",
      description: "Dành cho team nhỏ",
      features: [
        "Không giới hạn câu hỏi",
        "Không giới hạn quiz",
        "Báo cáo chi tiết",
        "Hỗ trợ 24/7",
        "API tích hợp",
        "Custom branding"
      ],
      popular: true,
      buttonText: "Bắt đầu ngay"
    },
    {
      name: "Enterprise",
      price: "Liên hệ",
      description: "Cho doanh nghiệp lớn",
      features: [
        "Tất cả tính năng Pro",
        "Máy chủ riêng",
        "SSO & LDAP",
        "Hỗ trợ triển khai",
        "Training & tư vấn",
        "SLA 99.9%"
      ],
      popular: false,
      buttonText: "Liên hệ tư vấn"
    }
  ];

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header className="bg-white shadow-sm px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🦆</span>
          </div>
          <Title level={3} className="m-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DuckMen Quiz System
          </Title>
        </div>
        <Space size="large">
          <Button type="text" size="large">Tính năng</Button>
          <Button type="text" size="large">Giá cả</Button>
          <Button type="text" size="large">Liên hệ</Button>
          <Button 
            type="primary" 
            size="large" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
            onClick={() => window.location.href = '/register'}
          >
            Đăng ký ngay
          </Button>
        </Space>
      </Header>

      <Content>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-8">
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} lg={12}>
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge.Ribbon text="🚀 Hệ thống Quiz Thông minh" color="purple">
                      <Title level={1} className="text-5xl font-bold leading-tight">
                        DuckMen Quiz System
                        <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Nền tảng Quiz Hiện đại
                        </span>
                        cho Giáo dục & Doanh nghiệp
                      </Title>
                    </Badge.Ribbon>
                    <Paragraph className="text-xl text-gray-600 leading-relaxed">
                      Hệ thống quiz toàn diện với giao diện Admin mạnh mẽ và trải nghiệm User tuyệt vời. 
                      Quản lý câu hỏi, tạo kỳ thi và theo dõi kết quả một cách chuyên nghiệp.
                    </Paragraph>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<RocketOutlined />}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 h-14 px-8 text-lg font-semibold"
                      onClick={() => window.location.href = '/register'}
                    >
                      Đăng ký ngay
                    </Button>
                    <Button 
                      size="large" 
                      icon={<PlayCircleOutlined />}
                      className="h-14 px-8 text-lg font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={() => setShowDemo(true)}
                    >
                      Xem Demo
                    </Button>
                  </div>

                  <div className="flex items-center space-x-8 pt-4">
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <Avatar key={i} size={40} src={`https://i.pravatar.cc/40?img=${i}`} className="border-2 border-white" />
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map(i => (
                          <StarOutlined key={i} className="text-yellow-400" />
                        ))}
                      </div>
                      <Text className="text-gray-600">Được tin dùng bởi 5,000+ người dùng</Text>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} lg={12}>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                      <TabPane tab={
                        <span className="flex items-center space-x-2">
                          <SettingOutlined />
                          <span>Admin Panel</span>
                        </span>
                      } key="admin">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Title level={4}>Dashboard Quản trị</Title>
                            <Badge count={5} className="bg-red-500">
                              <Avatar icon={<SettingOutlined />} />
                            </Badge>
                          </div>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="Câu hỏi đã tạo"
                                value={animatedStats.questions}
                                prefix={<EditOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Quiz hoạt động"
                                value={animatedStats.quizzes}
                                prefix={<QuestionCircleOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                              />
                            </Col>
                          </Row>
                          <Timeline>
                            <Timeline.Item color="green">Tạo quiz "Kiến thức Marketing" - 2 phút trước</Timeline.Item>
                            <Timeline.Item color="blue">Phê duyệt 15 câu hỏi mới - 5 phút trước</Timeline.Item>
                            <Timeline.Item>Cập nhật quyền user nhóm Sales - 10 phút trước</Timeline.Item>
                          </Timeline>
                        </div>
                      </TabPane>
                      
                      <TabPane tab={
                        <span className="flex items-center space-x-2">
                          <UserOutlined />
                          <span>User Experience</span>
                        </span>
                      } key="user">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Title level={4}>Bảng điểm cá nhân</Title>
                            <Badge count={3} className="bg-blue-500">
                              <Avatar icon={<TrophyOutlined />} />
                            </Badge>
                          </div>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="Quiz đã hoàn thành"
                                value={47}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Điểm trung bình"
                                value={8.7}
                                precision={1}
                                prefix={<StarOutlined />}
                                suffix="/ 10"
                                valueStyle={{ color: '#faad14' }}
                              />
                            </Col>
                          </Row>
                          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Text strong>Quiz tiếp theo</Text>
                                <div className="text-gray-600">Kiến thức Digital Marketing</div>
                              </div>
                              <Button type="primary" icon={<PlayCircleOutlined />}>
                                Bắt đầu
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabPane>
                    </Tabs>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                    <TrophyOutlined className="text-white text-2xl" />
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center" style={{animation: 'pulse 2s infinite'}}>
                    <CheckCircleOutlined className="text-white text-xl" />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <Row gutter={[32, 32]} className="text-center">
              <Col xs={12} md={6}>
                <Statistic
                  title="Người dùng hoạt động"
                  value={animatedStats.users}
                  valueStyle={{ color: '#1890ff', fontSize: '2.5rem', fontWeight: 'bold' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Quiz được tạo"
                  value={animatedStats.quizzes}
                  valueStyle={{ color: '#52c41a', fontSize: '2.5rem', fontWeight: 'bold' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Câu hỏi trong hệ thống"
                  value={animatedStats.questions}
                  valueStyle={{ color: '#faad14', fontSize: '2.5rem', fontWeight: 'bold' }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title="Lượt hoàn thành"
                  value={animatedStats.completed}
                  valueStyle={{ color: '#722ed1', fontSize: '2.5rem', fontWeight: 'bold' }}
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <Title level={2} className="text-4xl font-bold mb-4">
                DuckMen Quiz System <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
              </Title>
              <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hệ thống được thiết kế cho cả Admin và User với trải nghiệm tối ưu và tính năng mạnh mẽ
              </Paragraph>
            </div>
            
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:-translate-y-2"
                    bodyStyle={{ padding: '2rem' }}
                  >
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl mb-4">
                        {feature.icon}
                      </div>
                      <Title level={4} className="mb-3">{feature.title}</Title>
                      <Paragraph className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </Paragraph>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <Title level={2} className="text-4xl font-bold mb-4">
                Bảng giá <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Linh hoạt</span>
              </Title>
              <Paragraph className="text-xl text-gray-600">
                Chọn gói phù hợp với nhu cầu của bạn
              </Paragraph>
            </div>

            <Row gutter={[32, 32]} justify="center">
              {pricingPlans.map((plan, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    className={`h-full text-center relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : 'border border-gray-200'} hover:shadow-lg transition-all duration-300`}
                    bodyStyle={{ padding: '2rem' }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge count="Phổ biến nhất" className="bg-blue-500" />
                      </div>
                    )}
                    
                    <div className="space-y-6">
                      <div>
                        <Title level={3} className="mb-2">{plan.name}</Title>
                        <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
                        <Text className="text-gray-500">{plan.description}</Text>
                      </div>
                      
                      <Divider />
                      
                      <div className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-center space-x-2">
                            <CheckCircleOutlined className="text-green-500" />
                            <Text>{feature}</Text>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        type={plan.popular ? "primary" : "default"}
                        size="large"
                        block
                        className={plan.popular ? "bg-gradient-to-r from-blue-500 to-purple-600 border-0 h-12 font-semibold" : "h-12 font-semibold"}
                      >
                        {plan.buttonText}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <Title level={2} className="text-white text-4xl font-bold mb-6">
              Sẵn sàng tham gia DuckMen Quiz System?
            </Title>
            <Paragraph className="text-blue-100 text-xl mb-8 leading-relaxed">
              Tham gia cùng hàng nghìn người dùng đã tin tưởng DuckMen Quiz System để nâng cao hiệu quả học tập và đánh giá
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                className="bg-white text-blue-600 border-0 h-14 px-8 text-lg font-semibold hover:bg-gray-100"
                onClick={() => window.location.href = '/register'}
              >
                Đăng ký miễn phí
              </Button>
              <Button 
                size="large" 
                icon={<UserOutlined />}
                className="border-2 border-white text-white h-14 px-8 text-lg font-semibold hover:bg-white hover:text-blue-600"
                onClick={() => window.location.href = '/login'}
              >
                Đăng nhập
              </Button>
            </Space>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={8}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🦆</span>
                  </div>
                  <Title level={3} className="text-white m-0">DuckMen Quiz System</Title>
                </div>
                <Paragraph className="text-gray-400">
                  Hệ thống quiz thông minh và hiện đại, giúp bạn tạo và quản lý quiz chuyên nghiệp với trải nghiệm tuyệt vời.
                </Paragraph>
                <div className="flex space-x-4">
                  <Button type="text" icon={<MailOutlined />} className="text-gray-400">
                    hello@duckmen.vn
                  </Button>
                  <Button type="text" icon={<PhoneOutlined />} className="text-gray-400">
                    +84 901 234 567
                  </Button>
                </div>
              </div>
            </Col>
            
            <Col xs={12} md={4}>
              <Title level={5} className="text-white">Sản phẩm</Title>
              <div className="space-y-3">
                <div><Button type="text" className="text-gray-400 p-0">Tính năng</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">Bảng giá</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">API</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">Tích hợp</Button></div>
              </div>
            </Col>
            
            <Col xs={12} md={4}>
              <Title level={5} className="text-white">Hỗ trợ</Title>
              <div className="space-y-3">
                <div><Button type="text" className="text-gray-400 p-0">Trung tâm trợ giúp</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">Hướng dẫn</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">Video tutorial</Button></div>
                <div><Button type="text" className="text-gray-400 p-0">Liên hệ</Button></div>
              </div>
            </Col>
            
            <Col xs={24} md={8}>
              <Title level={5} className="text-white">Newsletter</Title>
              <Paragraph className="text-gray-400 mb-4">
                Đăng ký để nhận thông tin cập nhật mới nhất về sản phẩm
              </Paragraph>
              <Space.Compact className="w-full">
                <Input placeholder="Email của bạn" className="flex-1" />
                <Button type="primary" className="bg-gradient-to-r from-blue-500 to-purple-600 border-0">
                  Đăng ký
                </Button>
              </Space.Compact>
            </Col>
          </Row>
          
          <Divider className="border-gray-700 my-8" />
          
          <div className="flex justify-between items-center">
            <Text className="text-gray-400">
              © 2025 DuckMen Quiz System. All rights reserved.
            </Text>
            <Space>
              <Button type="text" className="text-gray-400">Chính sách bảo mật</Button>
              <Button type="text" className="text-gray-400">Điều khoản sử dụng</Button>
            </Space>
          </div>
        </div>
      </Footer>

      {/* Demo Modal */}
      <Modal
        title="🦆 Demo DuckMen Quiz System"
        open={showDemo}
        onCancel={() => setShowDemo(false)}
        footer={null}
        width={800}
        className="demo-modal"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Title level={3}>Trải nghiệm ngay tính năng nổi bật</Title>
            <Paragraph className="text-gray-600">
              Khám phá giao diện Admin và User trong một demo tương tác
            </Paragraph>
          </div>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <SettingOutlined className="text-4xl text-blue-500 mb-4" />
                <Title level={4}>Admin Demo</Title>
                <Paragraph>Tạo câu hỏi, quản lý quiz và xem báo cáo</Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Truy cập Demo
                </Button>
              </Card>
            </Col>
            <Col span={12}>
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <UserOutlined className="text-4xl text-green-500 mb-4" />
                <Title level={4}>User Demo</Title>
                <Paragraph>Làm quiz và xem kết quả chi tiết</Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Truy cập Demo
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    </Layout>
  );
};

export default Emty;