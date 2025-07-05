import React, { useEffect, useState, useRef } from 'react';
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
  Statistic, 
  Layout,
} from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';

const { Title } = Typography;
const { Option } = Select;
const { Content } = Layout;

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

  // Timeout ref for debouncing
  const timeoutRef = useRef(null);

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

  // Debounced filter function
  const debouncedFilter = (examCode, userId) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      fetchPracticeResults(examCode, userId);
    }, 300); // 500ms delay
  };

  // Handle exam code change
  const handleExamCodeChange = (value) => {
    setSelectedExamCode(value);
    debouncedFilter(value, selectedUserId);
  };

  // Handle user change
  const handleUserChange = (value) => {
    setSelectedUserId(value);
    debouncedFilter(selectedExamCode, value);
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

  const handleReset = () => {
    setSelectedExamCode(null);
    setSelectedUserId(null);
    
    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    fetchPracticeResults();
  };

  useEffect(() => {
    fetchPracticeResults();
    fetchExamCodes();
    fetchUsers();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const chartOption = {
    title: {
      text: 'Biểu đồ điểm trung bình theo ngày',
      left: 'center',
      top: '20px',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1890ff'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#1890ff',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#1890ff'
        }
      },
      formatter: (params) => {
        const dataIndex = params[0].dataIndex;
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; color: #1890ff; margin-bottom: 4px;">
              📅 ${params[0].name}
            </div>
            <div style="color: #333;">
              📊 Điểm TB: <span style="font-weight: bold; color: #52c41a;">${params[0].value}/10</span>
            </div>
          </div>
        `;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.dates,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        formatter: function(value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return `${date.getDate()}/${date.getMonth() + 1}`;
          }
          return value;
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f5f5f5',
          type: 'solid'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: '#f5f5f5',
          type: 'solid'
        }
      }
    },
    series: [
      {
        name: 'Điểm trung bình',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: chartData.avgScores,
        lineStyle: {
          width: 4,
          color: '#1890ff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 3
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#1890ff',
            borderColor: '#fff',
            borderWidth: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(24, 144, 255, 0.5)'
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            width: 2
          },
          label: {
            show: true,
            position: 'end',
            fontSize: 12,
            fontWeight: 'bold',
            padding: [4, 8],
            borderRadius: 4
          },
          data: [
            {
              yAxis: 5,
              lineStyle: {
                color: '#faad14'
              },
              label: {
                formatter: '🎯 Đạt (5.0)',
                color: '#faad14',
                backgroundColor: 'rgba(250, 173, 20, 0.1)'
              }
            },
            {
              yAxis: 8,
              lineStyle: {
                color: '#52c41a'
              },
              label: {
                formatter: '⭐ Khá (8.0)',
                color: '#52c41a',
                backgroundColor: 'rgba(82, 196, 26, 0.1)'
              }
            }
          ]
        }
      }
    ],
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  };

  // Thêm biểu đồ phân bố điểm số
  const scoreDistributionOption = {
    title: {
      text: 'Phân bố điểm số',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1890ff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '10px',
      data: ['0-4 điểm', '5-6 điểm', '7-8 điểm', '9-10 điểm']
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        data: [
          { 
            value: data.filter(d => d.score < 5).length, 
            name: '0-4 điểm',
            itemStyle: { color: '#ff4d4f' }
          },
          { 
            value: data.filter(d => d.score >= 5 && d.score < 7).length, 
            name: '5-6 điểm',
            itemStyle: { color: '#faad14' }
          },
          { 
            value: data.filter(d => d.score >= 7 && d.score < 9).length, 
            name: '7-8 điểm',
            itemStyle: { color: '#1890ff' }
          },
          { 
            value: data.filter(d => d.score >= 9).length, 
            name: '9-10 điểm',
            itemStyle: { color: '#52c41a' }
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}\n{c} bài ({d}%)'
        }
      }
    ]
  };

  // Biểu đồ cột so sánh điểm theo mã đề
  const examComparisonOption = {
    title: {
      text: 'So sánh điểm trung bình theo mã đề',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1890ff'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; color: #1890ff; margin-bottom: 4px;">
              📝 ${params[0].name}
            </div>
            <div style="color: #333;">
              📊 Điểm TB: <span style="font-weight: bold; color: #52c41a;">${params[0].value}/10</span>
            </div>
            <div style="color: #666; font-size: 12px;">
              👥 Số bài: ${params[0].data.count}
            </div>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'category',
      data: Object.keys(data.reduce((acc, curr) => {
        if (!acc[curr.examCode]) acc[curr.examCode] = [];
        acc[curr.examCode].push(curr.score);
        return acc;
      }, {})),
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLabel: {
        color: '#666'
      }
    },
    series: [
      {
        type: 'bar',
        data: Object.entries(data.reduce((acc, curr) => {
          if (!acc[curr.examCode]) acc[curr.examCode] = [];
          acc[curr.examCode].push(curr.score);
          return acc;
        }, {})).map(([examCode, scores]) => ({
          value: (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2),
          count: scores.length,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#1890ff' },
                { offset: 1, color: '#52c41a' }
              ]
            }
          }
        })),
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#666'
        }
      }
    ]
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
    <Layout>
      <AdminSidebar selectedKey="practice-results" setSelectedKey={() => {}} />
      <Layout style={{ flex: 1 }}>
        <Content style={{ padding: 24 }}>
          <Title level={2}>📊 Thống kê điểm số học sinh</Title>

          {/* Filter Section */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="bottom">
              <Col span={6}>
                <label>Mã đề thi:</label>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder="Chọn mã đề thi"
                  value={selectedExamCode}
                  onChange={handleExamCodeChange}
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
                  onChange={handleUserChange}
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
                <div style={{ marginTop: 24 }}>
                  <Space>
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
                </div>
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminScores;