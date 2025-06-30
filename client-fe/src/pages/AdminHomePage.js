import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Button,
  Space,
  Progress,
  List,
  Typography,
  Divider,
  Tag,
  Spin,
  message
} from 'antd';
import {
  DashboardOutlined,
  PlusCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  LinkOutlined,
  TagOutlined,
  DownloadOutlined,
  BellOutlined,
  UserOutlined,
  RiseOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Base URL for API calls
const API_BASE_URL = 'http://localhost:9999';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalExams: 0,
    averageScore: 0,
    activeClasses: 0,
    pendingScores: 0,
    completionRate: 0,
    recentActivities: [],
    topicStats: [],
    monthlyProgress: 0
  });

  // Enhanced authentication helper function
  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    if (!token) {
      message.error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      navigate('/admin/login');
      return null;
    }

    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };
  };

  // Enhanced API call wrapper with error handling
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const authConfig = getAuthConfig();
    if (!authConfig) return null;

    try {
      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        ...authConfig,
        ...options,
        headers: {
          ...authConfig.headers,
          ...options.headers
        }
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        navigate('/admin/login');
        return null;
      }
      throw error;
    }
  };

  // Fetch real data from APIs with enhanced authentication
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Check authentication first
        const authConfig = getAuthConfig();
        if (!authConfig) {
          setLoading(false);
          return;
        }

        // Parallel API calls with enhanced error handling
        const apiCalls = [
          makeAuthenticatedRequest('/api/classes'),
          makeAuthenticatedRequest('/api/classes'),
          makeAuthenticatedRequest('/api/admin/exams'),
          makeAuthenticatedRequest('/api/practice-results'),
          makeAuthenticatedRequest('/api/admin/topics'),
          makeAuthenticatedRequest('/api/admin/notifications')
        ];

        const results = await Promise.allSettled(apiCalls);

        // Process classes data
        const classesResult = results[0];
        const classes = classesResult.status === 'fulfilled' && classesResult.value ? classesResult.value.data : [];
        const totalClasses = classes.length;
        const activeClasses = classes.filter(cls => cls.status === 'active').length;

        // Process students data
        const studentsResult = results[1];
        const students = studentsResult.status === 'fulfilled' && studentsResult.value ? studentsResult.value.data : [];
        const totalStudents = students.length;

        // Process exams data
        const examsResult = results[2];
        const exams = examsResult.status === 'fulfilled' && examsResult.value ? examsResult.value.data : [];
        const totalExams = exams.length;

        // Process scores data
        const scoresResult = results[3];
        const scores = scoresResult.status === 'fulfilled' && scoresResult.value ? scoresResult.value.data : [];
        const numericScores = scores
          .filter(s => typeof s.score === 'number' && !isNaN(s.score));

        const averageScore = numericScores.length > 0
          ? (numericScores.reduce((sum, s) => sum + s.score, 0) / numericScores.length).toFixed(1)
          : 0;

        const completedScores = scores.filter(score => score.score !== null).length;
        const completionRate = scores.length > 0 ? Math.round((completedScores / scores.length) * 100) : 0;

        // Process topics data
        const topicsResult = results[4];
        const topics = topicsResult.status === 'fulfilled' && topicsResult.value ? topicsResult.value.data : [];

        // Process notifications data
        const notificationsResult = results[5];
        const notifications = notificationsResult.status === 'fulfilled' && notificationsResult.value ? notificationsResult.value.data : [];
        const pendingNotifications = notifications.filter(notif => notif.status === 'pending').length;

        // Generate recent activities from actual data
        const recentActivities = [
          ...classes.slice(0, 2).map(cls => ({
            id: `class-${cls.id}`,
            text: `Lớp ${cls.name} được tạo mới`,
            time: formatTimeAgo(cls.createdAt),
            type: 'success',
            class: cls.name
          })),
          ...exams.slice(0, 2).map(exam => ({
            id: `exam-${exam.id}`,
            text: `Bài thi "${exam.title}" được thêm vào hệ thống`,
            time: formatTimeAgo(exam.createdAt),
            type: 'info',
            subject: exam.subject
          })),
          ...scores.slice(0, 2).map(score => ({
            id: `score-${score.id}`,
            text: `Học sinh ${score.studentName} hoàn thành bài thi (${score.score}/10)`,
            time: formatTimeAgo(score.completedAt),
            type: score.score >= 8 ? 'success' : score.score >= 5 ? 'warning' : 'error',
            class: score.className
          }))
        ].slice(0, 5);

        // Calculate monthly progress (example: completion rate this month)
        const thisMonth = new Date().getMonth();
        const thisMonthScores = scores.filter(score =>
          new Date(score.createdAt).getMonth() === thisMonth
        );
        const monthlyProgress = thisMonthScores.length > 0
          ? Math.round((thisMonthScores.filter(s => s.score >= 5).length / thisMonthScores.length) * 100)
          : 0;

        setDashboardData({
          totalClasses,
          totalStudents,
          totalExams,
          averageScore: parseFloat(averageScore),
          activeClasses,
          pendingScores: scores.filter(score => score.score === null).length,
          completionRate,
          recentActivities,
          topicStats: topics.slice(0, 5),
          monthlyProgress,
          pendingNotifications
        });

        // Log successful API calls for debugging
        console.log('✅ Dashboard data loaded successfully from port 9999');
        console.log('📊 Data summary:', {
          classes: totalClasses,
          students: totalStudents,
          exams: totalExams,
          averageScore: parseFloat(averageScore)
        });

      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);

        // Enhanced error handling with specific messages
        if (error.code === 'ECONNREFUSED') {
          message.error('Không thể kết nối đến server cổng 9999. Vui lòng kiểm tra server.');
        } else if (error.response?.status === 403) {
          message.error('Không có quyền truy cập. Vui lòng kiểm tra quyền admin.');
        } else if (error.response?.status === 500) {
          message.error('Lỗi server nội bộ. Vui lòng thử lại sau.');
        } else {
          message.error('Không thể tải dữ liệu dashboard từ cổng 9999');
        }

        // Fallback to demo data if API fails
        setDashboardData({
          totalClasses: 0,
          totalStudents: 0,
          totalExams: 0,
          averageScore: 0,
          activeClasses: 0,
          pendingScores: 0,
          completionRate: 0,
          recentActivities: [],
          topicStats: [],
          monthlyProgress: 0,
          pendingNotifications: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Vừa xong';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Logout function with proper cleanup
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    message.success('Đăng xuất thành công');
    navigate('/admin/login');
  };

  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    try {
      // Re-fetch data with a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    } catch (error) {
      message.error('Không thể làm mới dữ liệu');
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Tổng số lớp học',
      value: dashboardData.totalClasses,
      prefix: <TeamOutlined />,
      color: '#1e40af',
      trend: dashboardData.activeClasses > 0 ? '+' + dashboardData.activeClasses + ' hoạt động' : 'Chưa có lớp hoạt động'
    },
    {
      title: 'Học sinh tham gia',
      value: dashboardData.totalStudents,
      prefix: <UserOutlined />,
      color: '#059669',
      trend: dashboardData.totalStudents > 0 ? 'Đang hoạt động' : 'Chưa có học sinh'
    },
    {
      title: 'Bài ôn tập',
      value: dashboardData.totalExams,
      prefix: <FileTextOutlined />,
      color: '#7c3aed',
      trend: dashboardData.totalExams > 0 ? 'Đã tạo' : 'Chưa có bài tập'
    },
    {
      title: 'Điểm trung bình',
      value: dashboardData.averageScore,
      suffix: '/10',
      prefix: <TrophyOutlined />,
      color: '#dc2626',
      trend: dashboardData.averageScore >= 8 ? 'Xuất sắc' : dashboardData.averageScore >= 6.5 ? 'Khá' : dashboardData.averageScore >= 5 ? 'Trung bình' : 'Cần cải thiện'
    }
  ];

  const quickActions = [
    {
      title: 'Tạo lớp học',
      icon: <PlusCircleOutlined />,
      color: '#1e40af',
      path: '/admin/classes',
      description: 'Tạo lớp học mới',
      count: dashboardData.totalClasses
    },
    {
      title: 'Gán bài ôn tập',
      icon: <LinkOutlined />,
      color: '#7c3aed',
      path: '/admin/assign-exam',
      description: 'Gán examCode cho lớp',
      count: dashboardData.totalExams
    },
    {
      title: 'Gửi thông báo',
      icon: <MessageOutlined />,
      color: '#0891b2',
      path: '/admin/notifications',
      description: 'Thông báo tới học sinh',
      count: dashboardData.pendingNotifications
    },
    {
      title: 'Xuất điểm',
      icon: <DownloadOutlined />,
      color: '#dc2626',
      path: '/admin/export',
      description: 'Tải file Excel',
      count: dashboardData.pendingScores
    }
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'classes',
      icon: <TeamOutlined />,
      label: 'Quản lý lớp học',
    },
    {
      key: 'exams',
      icon: <FileTextOutlined />,
      label: 'Câu hỏi ôn tập',
    },
    {
      key: 'scores',
      icon: <BarChartOutlined />,
      label: 'Xem điểm số',
    },
    {
      key: 'topics',
      icon: <TagOutlined />,
      label: 'Quản lý chủ đề',
    },
    {
      key: 'assign-exam',
      icon: <LinkOutlined />,
      label: 'Gán bài ôn tập',
    },
    {
      key: 'notifications',
      icon: <MessageOutlined />,
      label: 'Gửi thông báo',
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: 'Xuất điểm Excel',
    }
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    if (e.key !== 'dashboard') {
      navigate(`/admin/${e.key}`);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'error': return <WarningOutlined />;
      case 'info': return <InfoCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return '#059669';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      case 'info': return '#2563eb';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
        <Text style={{ marginLeft: 16, color: 'white', fontSize: 16 }}>
          Đang tải dữ liệu từ cổng 9999...
        </Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        style={{
          background: 'linear-gradient(145deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          padding: '24px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
        }}>
          <Avatar size={72} style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            border: '3px solid rgba(255,255,255,0.2)'
          }}>
            <UserOutlined style={{ fontSize: 32 }} />
          </Avatar>
          <Title level={4} style={{ color: 'white', marginTop: 16, marginBottom: 6 }}>
            Admin Dashboard
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Hệ thống quản lý học tập (Port 9999)
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 16,
            paddingInline: 8
          }}
          items={menuItems.map(item => ({
            ...item,
            style: {
              borderRadius: 8,
              margin: '4px 0',
              height: 44
            }
          }))}
        />
      </Sider>

      <Layout>
        <Header style={{
          background: 'linear-gradient(90deg, #ffffff 0%, #f8fafc 100%)',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>
              Dashboard Quản Trị
            </Title>
            <Text style={{ color: '#64748b', fontSize: 14 }}>
              Chào mừng bạn quay trở lại - API Port 9999
            </Text>
          </div>
          <Space size="large">
            <Button
              type="text"
              icon={<RiseOutlined />}
              onClick={refreshData}
              style={{ color: '#64748b' }}
            >
              Làm mới
            </Button>
            <Badge count={dashboardData.pendingNotifications} showZero>
              <BellOutlined style={{ fontSize: 20, color: '#64748b' }} />
            </Badge>
            <Button
              type="text"
              danger
              onClick={handleLogout}
              style={{ color: '#dc2626' }}
            >
              Đăng xuất
            </Button>
            <Avatar style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
              Admin
            </Avatar>
          </Space>
        </Header>

        <Content style={{ margin: '24px', background: '#f1f5f9', minHeight: 'calc(100vh - 112px)' }}>
          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  style={{
                    borderRadius: 16,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}10 100%)`,
                    borderRadius: '0 0 0 80px'
                  }} />
                  <Statistic
                    title={
                      <Text style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                        {stat.title}
                      </Text>
                    }
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={
                      <span style={{
                        color: stat.color,
                        fontSize: 24,
                        padding: '8px',
                        background: `${stat.color}15`,
                        borderRadius: 8,
                        marginRight: 8
                      }}>
                        {stat.prefix}
                      </span>
                    }
                    valueStyle={{
                      color: '#1e293b',
                      fontSize: 32,
                      fontWeight: 700
                    }}
                  />
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                    {stat.trend}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            {/* Quick Actions */}
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space>
                    <FireOutlined style={{ color: '#3b82f6' }} />
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>Thao tác nhanh</span>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Row gutter={[16, 16]}>
                  {quickActions.map((action, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 12,
                          border: `2px solid ${action.color}20`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: 'white'
                        }}
                        bodyStyle={{ padding: 20 }}
                        onClick={() => navigate(action.path)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Space>
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 12,
                              background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${action.color}30`
                            }}>
                              <span style={{ color: action.color, fontSize: 20 }}>
                                {action.icon}
                              </span>
                            </div>
                            <div>
                              <Text strong style={{ color: '#1e293b', fontSize: 16 }}>
                                {action.title}
                              </Text>
                              <br />
                              <Text style={{ color: '#64748b', fontSize: 13 }}>
                                {action.description}
                              </Text>
                            </div>
                          </Space>
                          <Badge count={action.count} showZero style={{ backgroundColor: action.color }} />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Progress Overview */}
              <Card
                title={
                  <Space>
                    <BookOutlined style={{ color: '#059669' }} />
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>Tổng quan tiến độ</span>
                  </Space>
                }
                style={{
                  marginTop: 24,
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Row gutter={[32, 32]}>
                  <Col xs={24} sm={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={dashboardData.completionRate}
                        strokeColor={{
                          '0%': '#3b82f6',
                          '100%': '#8b5cf6',
                        }}
                        size={120}
                        strokeWidth={8}
                        format={percent => (
                          <div>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>
                              {percent}%
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              Hoàn thành
                            </div>
                          </div>
                        )}
                      />
                      <Text style={{ display: 'block', marginTop: 16, color: '#64748b', fontSize: 14 }}>
                        Tỷ lệ hoàn thành bài tập
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress
                        type="circle"
                        percent={dashboardData.monthlyProgress}
                        strokeColor={{
                          '0%': '#059669',
                          '100%': '#10b981',
                        }}
                        size={120}
                        strokeWidth={8}
                        format={percent => (
                          <div>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>
                              {percent}%
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              Đạt yêu cầu
                            </div>
                          </div>
                        )}
                      />
                      <Text style={{ display: 'block', marginTop: 16, color: '#64748b', fontSize: 14 }}>
                        Tỷ lệ đạt điểm tháng này
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Recent Activities */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined style={{ color: '#d97706' }} />
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>Hoạt động gần đây</span>
                  </Space>
                }
                style={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  height: 'fit-content'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                {dashboardData.recentActivities.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={dashboardData.recentActivities}
                    renderItem={item => (
                      <List.Item style={{ padding: '16px 0', border: 'none' }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={40}
                              style={{
                                backgroundColor: getActivityColor(item.type),
                                border: `2px solid ${getActivityColor(item.type)}20`
                              }}
                            >
                              {getActivityIcon(item.type)}
                            </Avatar>
                          }
                          title={
                            <Text style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>
                              {item.text}
                            </Text>
                          }
                          description={
                            <Space size="small">
                              <Text style={{ fontSize: 12, color: '#64748b' }}>
                                {item.time}
                              </Text>
                              {item.class && (
                                <Tag color="blue" size="small">{item.class}</Tag>
                              )}
                              {item.subject && (
                                <Tag color="green" size="small">{item.subject}</Tag>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <ClockCircleOutlined style={{ fontSize: 48, color: '#d1d5db' }} />
                    <Text style={{ display: 'block', marginTop: 16, color: '#64748b' }}>
                      Chưa có hoạt động nào
                    </Text>
                  </div>
                )}
              </Card>

              {/* Quick Stats */}
              <Card
                title={
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>Thống kê nhanh</span>
                }
                style={{
                  marginTop: 24,
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#1e293b', fontWeight: 500 }}>Lớp học hoạt động</Text>
                    <Tag color="#1e40af" style={{ borderRadius: 8, padding: '4px 8px' }}>
                      {dashboardData.activeClasses}/{dashboardData.totalClasses}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#1e293b', fontWeight: 500 }}>Bài chưa chấm</Text>
                    <Tag color="#dc2626" style={{ borderRadius: 8, padding: '4px 8px' }}>
                      {dashboardData.pendingScores} bài
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#1e293b', fontWeight: 500 }}>Thông báo chờ</Text>
                    <Tag color="#d97706" style={{ borderRadius: 8, padding: '4px 8px' }}>
                      {dashboardData.pendingNotifications} tin
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#1e293b', fontWeight: 500 }}>Tổng chủ đề</Text>
                    <Tag color="#7c3aed" style={{ borderRadius: 8, padding: '4px 8px' }}>
                      {dashboardData.topicStats.length} chủ đề
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;