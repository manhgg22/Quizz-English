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
  TagOutlined,
  DownloadOutlined,
  BellOutlined,
  UserOutlined,
  RiseOutlined,
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
    totalSets: 0,
    topicStats: [],
    exams: []
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

  // Fixed fetch practice results function
  const fetchPracticeResults = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/practice-results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      console.log('✅ Practice results fetched:', results);
      return results;
    } catch (error) {
      console.error('❌ Error fetching practice results:', error);
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
          makeAuthenticatedRequest('/api/classes'), // This seems to be for students, you might need a different endpoint
          makeAuthenticatedRequest('/api/practice-questions'),
          fetchPracticeResults(), // Use the fixed function
          makeAuthenticatedRequest('/api/admin/topics')
        ];

        const results = await Promise.allSettled(apiCalls);

        // Process classes data
        const classesResult = results[0];
        const classes = classesResult.status === 'fulfilled' && classesResult.value ? classesResult.value.data : [];
        const totalClasses = Array.isArray(classes) ? classes.length : 0;
        const activeClasses = Array.isArray(classes) ? classes.filter(cls => cls.status === 'active').length : 0;

        // Process students data (you might need a separate endpoint for students)
        const studentsResult = results[1];
        const students = studentsResult.status === 'fulfilled' && studentsResult.value ? studentsResult.value.data : [];
        const totalStudents = Array.isArray(students) ? students.length : 0;

        // Process exams data
        const examsResult = results[2];
        let totalSets = 0;
        let examList = [];

        if (examsResult.status === 'fulfilled' && examsResult.value) {
          const examData = examsResult.value.data;
          totalSets = examData?.totalSets || 0;
          examList = Array.isArray(examData?.exams) ? examData.exams : [];
        }

        // Process practice results data - FIXED
        const practiceResultsResult = results[3];
        let practiceResults = [];
        if (practiceResultsResult.status === 'fulfilled' && practiceResultsResult.value) {
          practiceResults = Array.isArray(practiceResultsResult.value) ? practiceResultsResult.value : [];
        }

        console.log('📊 Practice results processed:', practiceResults.length, 'results');

        // Calculate average score from practice results
        const validScores = practiceResults
          .filter(result => result.score !== null && result.score !== undefined && !isNaN(result.score))
          .map(result => parseFloat(result.score));

        const averageScore = validScores.length > 0
          ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(1)
          : 0;

        // Calculate completion rate
        const completedResults = practiceResults.filter(result => result.score !== null && result.score !== undefined);
        const completionRate = practiceResults.length > 0
          ? Math.round((completedResults.length / practiceResults.length) * 100)
          : 0;

        // Count pending scores
        const pendingScores = practiceResults.filter(result => result.score === null || result.score === undefined).length;

        // Process topics data
        const topicsResult = results[4];
        const topics = topicsResult.status === 'fulfilled' && topicsResult.value ? topicsResult.value.data : [];

        // Generate recent activities from actual data
        const recentActivities = [];

        // Add activities from classes
        if (Array.isArray(classes)) {
          classes.slice(0, 2).forEach(cls => {
            recentActivities.push({
              id: `class-${cls.id}`,
              text: `Lớp ${cls.name || cls.className || 'N/A'} được tạo mới`,
              time: formatTimeAgo(cls.createdAt || cls.created_at),
              type: 'success',
              class: cls.name || cls.className
            });
          });
        }

        // Add activities from exams
        // Add activities from exams
        if (Array.isArray(examList)) {
          examList.slice(0, 2).forEach(exam => {

            recentActivities.push({
              id: `exam-${exam.id}`,
              text: `Bài thi "${exam.title || 'N/A'}" được thêm vào hệ thống`,
              time: formatTimeAgo(exam.createdAt || exam.created_at),
              type: 'info',
              subject: exam.subject || exam.topic
            });
          });
        }

        // Add activities from practice results
        practiceResults.slice(0, 2).forEach(result => {
          if (result.score !== null && result.score !== undefined) {
            recentActivities.push({
              id: `result-${result.id}`,
              text: `Học sinh ${result.studentName || result.student_name || 'N/A'} hoàn thành bài thi (${result.score}/10)`,
              time: formatTimeAgo(result.completedAt || result.completed_at || result.createdAt || result.created_at),
              type: result.score >= 8 ? 'success' : result.score >= 5 ? 'warning' : 'error',
              class: result.className || result.class_name
            });
          }
        });

        // Limit to 5 activities
        const limitedActivities = recentActivities.slice(0, 5);

        setDashboardData({
          totalClasses,
          totalStudents,
          exams: totalSets, // ✅ Sửa tại đây
          averageScore: parseFloat(averageScore),
          activeClasses,
          pendingScores,
          completionRate,
          recentActivities: limitedActivities,
          topicStats: Array.isArray(topics) ? topics.slice(0, 5) : [],
          totalSets,  // ✅ Cần thêm để dùng ở nơi khác
          exams: examList  // ✅ Thêm để dùng cho các thống kê khác
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
          topicStats: []
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
      value: dashboardData.totalSets,
      prefix: <FileTextOutlined />,
      color: '#7c3aed',
      trend: dashboardData.totalSets > 0 ? `Tổng số bộ đề: ${dashboardData.totalSets}` : 'Chưa có bộ đề'
    }
    ,

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
      key: 'practice-results',
      icon: <BarChartOutlined />,
      label: 'Xem điểm số',
    },
    {
      key: 'topics',
      icon: <TagOutlined />,
      label: 'Quản lý chủ đề',
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
          Đang tải dữ liệu từ server
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

      <Content style={{ margin: '24px', background: '#f1f5f9' }}>

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