import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { 
  Table, 
  Card, 
  Typography, 
  message, 
  Spin, 
  Button, 
  Select, 
  Row, 
  Col, 
  Space,
  Statistic 
} from 'antd';
import { DownloadOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const AdminScores = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [examCodes, setExamCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedExamCode, setSelectedExamCode] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalResults: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0
  });

  const fetchExamCodes = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:9999/api/practice-results/exam-codes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExamCodes(response.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách mã đề:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:9999/api/practice-results/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách user:', err);
    }
  };

  const fetchPracticeResults = async (examCode = null, userId = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      let url = 'http://localhost:9999/api/practice-results';
      const params = new URLSearchParams();
      
      if (examCode) params.append('examCode', examCode);
      if (userId) params.append('userId', userId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const results = response.data || [];
      setData(results);
      
      // Calculate statistics
      if (results.length > 0) {
        const scores = results.map(r => r.score);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const avgScore = (totalScore / scores.length).toFixed(2);
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        
        setStats({
          totalResults: results.length,
          avgScore: parseFloat(avgScore),
          maxScore,
          minScore
        });
      } else {
        setStats({
          totalResults: 0,
          avgScore: 0,
          maxScore: 0,
          minScore: 0
        });
      }

      // Prepare data for chart
      const chartGrouped = results.reduce((acc, curr) => {
        const date = new Date(curr.submittedAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr.score);
        return acc;
      }, {});

      const dates = Object.keys(chartGrouped).sort();
      const avgScores = dates.map(date => {
        const scores = chartGrouped[date];
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return avg.toFixed(2);
      });

      setChartData({ dates, avgScores });
    } catch (err) {
      console.error('Lỗi khi fetch dữ liệu practice:', err);
      message.error('Không thể tải dữ liệu điểm số');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      let url = 'http://localhost:9999/api/practice-results/export-excel';
      const params = new URLSearchParams();
      
      if (selectedExamCode) params.append('examCode', selectedExamCode);
      if (selectedUserId) params.append('userId', selectedUserId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important for file download
      });

      // Create blob link to download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const fileName = `ket-qua-lam-bai-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('Xuất Excel thành công!');
    } catch (err) {
      console.error('Lỗi khi xuất Excel:', err);
      message.error('Không thể xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleFilter = () => {
    fetchPracticeResults(selectedExamCode, selectedUserId);
  };

  const handleReset = () => {
    setSelectedExamCode(null);
    setSelectedUserId(null);
    fetchPracticeResults();
  };

  useEffect(() => {
    fetchPracticeResults();
    fetchExamCodes();
    fetchUsers();
  }, []);

  const chartOption = {
    title: {
      text: 'Biểu đồ điểm trung bình theo ngày',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const dataIndex = params[0].dataIndex;
        return `${params[0].name}<br/>Điểm TB: ${params[0].value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.dates,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
    },
    series: [
      {
        data: chartData.avgScores,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(64, 158, 255, 0.8)'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0.1)'
            }]
          }
        },
        name: 'Điểm TB',
        itemStyle: {
          color: '#409EFF'
        }
      },
    ],
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã đề thi',
      dataIndex: 'examCode',
      key: 'examCode',
      sorter: (a, b) => a.examCode.localeCompare(b.examCode),
    },
    {
      title: 'Số câu đúng',
      dataIndex: 'correct',
      key: 'correct',
      sorter: (a, b) => a.correct - b.correct,
    },
    {
      title: 'Tổng số câu',
      dataIndex: 'total',
      key: 'total',
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <span style={{ 
          color: score >= 8 ? '#52c41a' : score >= 5 ? '#faad14' : '#f5222d',
          fontWeight: 'bold'
        }}>
          {score}/10
        </span>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: 'Thời gian nộp',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (time) => new Date(time).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>📊 Thống kê điểm số học sinh</Title>

      {/* Filter Section */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <label>Mã đề thi:</label>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Chọn mã đề thi"
              value={selectedExamCode}
              onChange={setSelectedExamCode}
              allowClear
            >
              {examCodes.map(code => (
                <Option key={code} value={code}>{code}</Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <label>Học sinh:</label>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Chọn học sinh"
              value={selectedUserId}
              onChange={setSelectedUserId}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button 
                type="primary" 
                icon={<FilterOutlined />}
                onClick={handleFilter}
                loading={loading}
              >
                Lọc
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                Đặt lại
              </Button>
              <Button 
                type="default"
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                loading={exporting}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số bài làm" value={stats.totalResults} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Điểm trung bình" 
              value={stats.avgScore} 
              precision={2}
              suffix="/10"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Điểm cao nhất" 
              value={stats.maxScore} 
              suffix="/10"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Điểm thấp nhất" 
              value={stats.minScore} 
              suffix="/10"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* Chart */}
          {chartData.dates && chartData.dates.length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <ReactECharts option={chartOption} style={{ height: '400px' }} />
            </Card>
          )}

          {/* Table */}
          <Card title={`Danh sách kết quả nộp bài (${data.length} kết quả)`}>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="_id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} kết quả`
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminScores;