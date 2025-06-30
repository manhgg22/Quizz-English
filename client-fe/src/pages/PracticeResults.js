import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Typography, 
  message, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Tag, 
  Space,
  Avatar,
  Tooltip,
  Empty,
  Spin,
  Button,
  Input,
  Select,
  DatePicker
} from 'antd';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PracticeResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    const filtered = results.filter(item =>
      item.examCode?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [searchText, results]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:9999/api/practice-results', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      setFilteredResults(data);
    } catch (err) {
      console.error('Fetch error:', err);
      message.error('Lỗi khi lấy kết quả luyện tập');
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const dateFormatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return { time, date: dateFormatted };
  };

  // Tính toán thống kê
  const statistics = React.useMemo(() => {
    if (!results.length) return { totalExams: 0, avgScore: 0, totalCorrect: 0, totalQuestions: 0 };
    
    const totalExams = results.length;
    const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / totalExams;
    const totalCorrect = results.reduce((sum, r) => sum + (r.correct || 0), 0);
    const totalQuestions = results.reduce((sum, r) => sum + (r.total || 0), 0);
    
    return { totalExams, avgScore, totalCorrect, totalQuestions };
  }, [results]);

  const getScoreColor = (score) => {
    if (score >= 8) return '#52c41a';
    if (score >= 6.5) return '#faad14';
    if (score >= 5) return '#fa8c16';
    return '#ff4d4f';
  };

  const getScoreStatus = (score) => {
    if (score >= 8) return 'Xuất sắc';
    if (score >= 6.5) return 'Khá';
    if (score >= 5) return 'Trung bình';
    return 'Yếu';
  };

  const columns = [
    {
      title: 'Mã bài thi',
      dataIndex: 'examCode',
      key: 'examCode',
      width: 150,
      render: (code) => (
        <Space>
          <Avatar size="small" icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Text strong>{code}</Text>
        </Space>
      )
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: getScoreColor(record.score) }}>
            {record.correct || 0}/{record.total || 0}
          </Text>
          <Progress 
            percent={record.total ? Math.round((record.correct / record.total) * 100) : 0} 
            size="small"
            strokeColor={getScoreColor(record.score)}
            showInfo={false}
          />
        </Space>
      )
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      render: (score) => (
        <Space direction="vertical" size={0} align="center">
          <Text strong style={{ fontSize: 16, color: getScoreColor(score) }}>
            {score ? score.toFixed(1) : '0.0'}
          </Text>
          <Tag color={getScoreColor(score)} style={{ margin: 0, fontSize: 11 }}>
            {getScoreStatus(score)}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      render: (dateString) => {
        const { time, date } = formatDateTime(dateString);
        return (
          <Space>
            <ClockCircleOutlined style={{ color: '#666' }} />
            <Space direction="vertical" size={0}>
              <Text>{time}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {date}
              </Text>
            </Space>
          </Space>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="link" size="small" icon={<SearchOutlined />} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }} bordered={false}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space align="center">
                <Avatar 
                  size={48} 
                  icon={<TrophyOutlined />} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div>
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    Lịch sử luyện tập
                  </Title>
                  <Text type="secondary">
                    Theo dõi quá trình học tập và cải thiện kết quả
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchResults} loading={loading}>
                  Làm mới
                </Button>
                <Button type="primary" icon={<DownloadOutlined />}>
                  Xuất báo cáo
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Tổng số bài thi"
                value={statistics.totalExams}
                prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Điểm trung bình"
                value={statistics.avgScore}
                precision={1}
                prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Tổng câu đúng"
                value={statistics.totalCorrect}
                prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Statistic
                title="Tỷ lệ chính xác"
                value={statistics.totalQuestions ? (statistics.totalCorrect / statistics.totalQuestions * 100) : 0}
                precision={1}
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#eb2f96' }} />}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card 
          style={{ marginBottom: 24, borderRadius: 12 }} 
          bordered={false}
          bodyStyle={{ padding: 16 }}
        >
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Input
                placeholder="Tìm kiếm theo mã bài thi..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Select
                placeholder="Lọc theo điểm"
                style={{ width: 150 }}
                allowClear
              >
                <Select.Option value="excellent">Xuất sắc (≥8)</Select.Option>
                <Select.Option value="good">Khá (6.5-7.9)</Select.Option>
                <Select.Option value="average">Trung bình (5-6.4)</Select.Option>
                <Select.Option value="poor">Yếu (&lt;5)</Select.Option>
              </Select>
            </Col>
            <Col>
              <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
            </Col>
          </Row>
        </Card>

        {/* Results Table */}
        <Card 
          bordered={false} 
          style={{ borderRadius: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <Spin spinning={loading}>
            {filteredResults.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredResults}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} kết quả`,
                  style: { padding: '16px 24px' }
                }}
                style={{ borderRadius: 12 }}
                scroll={{ x: 800 }}
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
              />
            ) : (
              <div style={{ padding: 48 }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={loading ? "Đang tải..." : "Chưa có kết quả luyện tập nào"}
                >
                  {!loading && (
                    <Button type="primary">Bắt đầu luyện tập</Button>
                  )}
                </Empty>
              </div>
            )}
          </Spin>
        </Card>
      </div>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default PracticeResults;