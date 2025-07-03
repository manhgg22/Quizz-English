import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  Table, 
  Button, 
  Modal, 
  Input, 
  message, 
  Select, 
  Typography, 
  List, 
  Space,
  Divider,
  Row,
  Col,
  Alert,
  Empty,
  Avatar
} from 'antd';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AdminClassManagement = () => {
  // States cho tab tạo lớp
  const [className, setClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  
  // States chung
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // States cho tab quản lý
  const [editingClass, setEditingClass] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testOptions, setTestOptions] = useState([]);
  
  // States cho modal xem học sinh
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState('');

  const token = localStorage.getItem('token');

  // Fetch functions
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:9999/api/classes', {
        headers: { Authorization: 'Bearer ' + token },
      });
      setClasses(res.data);
    } catch (err) {
      message.error('Lỗi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await axios.get('http://localhost:9999/api/practice-results/exam-codes', {
        
        headers: { Authorization: 'Bearer ' + token },
      });
      setTestOptions(res.data);
    } catch (err) {
      message.error('Lỗi tải bài thi');
    }
  };

  // Handlers cho tab tạo lớp
  const handleCreateClass = async () => {
    if (!className.trim()) {
      return message.warning('Vui lòng nhập tên lớp');
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/classes', 
        { name: className }, 
        { headers: { Authorization: 'Bearer ' + token } }
      );
      
      setNewClassCode(res.data.code);
      setClassName('');
      message.success('Tạo lớp thành công!');
      fetchClasses();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo lớp');
    } finally {
      setLoading(false);
    }
  };

  // Handlers cho tab quản lý
  const handleEdit = (cls) => {
    setEditingClass(cls);
    setNewName(cls.name);
  };

  const saveEdit = async () => {
    if (!newName.trim()) {
      return message.warning('Tên lớp không được để trống');
    }

    try {
      await axios.put(`http://localhost:9999/api/classes/${editingClass._id}`, {
        name: newName,
      }, { headers: { Authorization: 'Bearer ' + token } });
      
      message.success('Cập nhật tên lớp thành công');
      setEditingClass(null);
      setNewName('');
      fetchClasses();
    } catch {
      message.error('Không thể cập nhật');
    }
  };

  const deleteClass = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa lớp',
      content: 'Bạn có chắc chắn muốn xóa lớp này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:9999/api/classes/${id}`, {
            headers: { Authorization: 'Bearer ' + token },
          });
          message.success('Đã xóa lớp');
          fetchClasses();
        } catch (err) {
          message.error(err.response?.data?.message || 'Lỗi xóa lớp');
        }
      }
    });
  };

  const assignTest = async (cls) => {
    if (!selectedTest) return message.warning('Chọn bài thi trước');
    
    try {
      await axios.post(`http://localhost:9999/api/classes/${cls._id}/assign-test`, {
        testId: selectedTest,
      }, { headers: { Authorization: 'Bearer ' + token } });
      
      message.success('Đã gán bài thi');
      setSelectedTest(null);
    } catch {
      message.error('Không thể gán bài thi');
    }
  };

  const sendNotification = async (cls) => {
    const msg = prompt('Nhập thông báo muốn gửi:');
    if (!msg) return;
    
    try {
      await axios.post(`http://localhost:9999/api/classes/${cls._id}/notify`, {
        message: msg,
      }, { headers: { Authorization: 'Bearer ' + token } });
      
      message.success('Đã gửi thông báo');
    } catch {
      message.error('Lỗi gửi thông báo');
    }
  };

  const handleShowStudents = (students, className) => {
    setSelectedStudents(students);
    setSelectedClassName(className);
    setStudentsModalVisible(true);
  };

  // Columns cho bảng quản lý lớp
  const columns = [
    {
      title: 'Thông tin lớp',
      render: (_, cls) => (
        <div>
          <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
            {cls.name}
          </Title>
          <Text type="secondary">Mã: {cls.code}</Text>
        </div>
      )
    },
    {
      title: 'Học sinh',
      render: (_, cls) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 16 }}>
            {cls.students?.length || 0}
          </Text>
          <Button 
            type="link" 
            size="small"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => handleShowStudents(cls.students, cls.name)}
          >
            Xem danh sách
          </Button>
        </Space>
      )
    },
    {
      title: 'Quản lý',
      render: (_, cls) => (
        <Space direction="vertical" size="small">
          <Space>
            <Button 
              type="primary" 
              size="small" 
              onClick={() => handleEdit(cls)}
            >
              Chỉnh sửa
            </Button>
            <Button 
              danger 
              size="small"
              onClick={() => deleteClass(cls._id)} 
              disabled={cls.students?.length > 0}
            >
              Xóa
            </Button>
          </Space>
          <Space>
            <Button 
              size="small" 
              onClick={() => sendNotification(cls)}
            >
              Gửi thông báo
            </Button>
          </Space>
        </Space>
      )
    },
    {
      title: 'Gán bài thi',
      render: (_, cls) => (
        <Space direction="vertical" size="small">
          <Select
            placeholder="Chọn bài thi"
            style={{ width: 150 }}
            value={selectedTest}
            onChange={setSelectedTest}
            onFocus={fetchTests}
            allowClear
          >
            {testOptions.map(test => (
              <Select.Option key={test._id} value={test._id}>
                {test.title}
              </Select.Option>
            ))}
          </Select>
          <Button 
            type="primary"
            size="small" 
            onClick={() => assignTest(cls)}
            disabled={!selectedTest}
            block
          >
            Gán bài thi
          </Button>
        </Space>
      )
    }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(90deg, #1890ff, #096dd9)',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            📚 Hệ thống quản lý lớp học
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
            Tạo và quản lý các lớp học một cách hiệu quả
          </Paragraph>
        </div>

        {/* Statistics */}
        <div style={{ padding: '24px' }}>
          <Row gutter={24}>
            <Col span={8}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                borderRadius: 8,
                color: 'white'
              }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  {classes.length}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Tổng số lớp
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #26de81, #20bf6b)',
                borderRadius: 8,
                color: 'white'
              }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  {classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Tổng học sinh
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                background: 'linear-gradient(135deg, #fd79a8, #e84393)',
                borderRadius: 8,
                color: 'white'
              }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  {classes.length > 0 ? 
                    Math.round(classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0) / classes.length) 
                    : 0}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  TB/lớp
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Main Content */}
        <div style={{ padding: '0 24px 24px' }}>
          <Tabs 
            defaultActiveKey="1" 
            size="large"
            style={{
              '& .ant-tabs-tab': {
                fontSize: '16px',
                fontWeight: 500
              }
            }}
          >
            {/* Tab tạo lớp */}
            <TabPane tab="🎯 Tạo lớp mới" key="1">
              <Row gutter={24}>
                <Col span={12}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '32px',
                    borderRadius: 8,
                    border: '1px solid #e9ecef'
                  }}>
                    <Title level={4}>📝 Tạo lớp học mới</Title>
                    
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <Input
                        placeholder="Nhập tên lớp học..."
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        size="large"
                        style={{ borderRadius: 6 }}
                      />
                      
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleCreateClass}
                        loading={loading}
                        block
                        style={{ 
                          height: 48,
                          borderRadius: 6,
                          fontSize: 16,
                          fontWeight: 500
                        }}
                      >
                        ✨ Tạo lớp học
                      </Button>
                    </Space>

                    {newClassCode && (
                      <Alert
                        message={
                          <Space>
                            <Text strong>🎉 Tạo lớp thành công!</Text>
                          </Space>
                        }
                        description={
                          <Text>
                            Mã lớp: <Text code style={{ fontSize: 16, padding: '4px 8px' }}>
                              {newClassCode}
                            </Text>
                          </Text>
                        }
                        type="success"
                        showIcon
                        style={{ marginTop: 16, borderRadius: 6 }}
                      />
                    )}
                  </div>
                </Col>

                <Col span={12}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '32px',
                    borderRadius: 8,
                    border: '1px solid #e9ecef',
                    height: '100%'
                  }}>
                    <Title level={4}>📊 Danh sách lớp đã tạo</Title>
                    
                    {classes.length === 0 ? (
                      <Empty 
                        description="Chưa có lớp học nào"
                        style={{ margin: '40px 0' }}
                      />
                    ) : (
                      <List
                        dataSource={classes}
                        renderItem={item => (
                          <List.Item style={{ 
                            padding: '16px 0',
                            borderBottom: '1px solid #f0f0f0'
                          }}>
                            <List.Item.Meta
                              avatar={
                                <Avatar 
                                  style={{ 
                                    backgroundColor: '#1890ff',
                                    fontSize: 16
                                  }}
                                >
                                  {item.name.charAt(0).toUpperCase()}
                                </Avatar>
                              }
                              title={
                                <Text strong style={{ fontSize: 16 }}>
                                  {item.name}
                                </Text>
                              }
                              description={
                                <Space direction="vertical" size={2}>
                                  <Text type="secondary">
                                    📋 Mã: {item.code}
                                  </Text>
                                  <Text type="secondary">
                                    👥 {item.students?.length || 0} học sinh
                                  </Text>
                                </Space>
                              }
                            />
                            <Button 
                              type="link"
                              onClick={() => handleShowStudents(item.students, item.name)}
                            >
                              Xem chi tiết →
                            </Button>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </TabPane>

            {/* Tab quản lý lớp */}
            <TabPane tab="⚙️ Quản lý lớp" key="2">
              <div style={{
                background: '#f8f9fa',
                padding: '24px',
                borderRadius: 8,
                border: '1px solid #e9ecef'
              }}>
                <Title level={4} style={{ marginBottom: 24 }}>
                  🔧 Bảng điều khiển quản lý lớp
                </Title>
                
                <Table 
                  columns={columns} 
                  dataSource={classes} 
                  rowKey="_id"
                  loading={loading}
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                    showQuickJumper: true
                  }}
                  style={{
                    background: 'white',
                    borderRadius: 6
                  }}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Modal chỉnh sửa tên lớp */}
      <Modal
        title="✏️ Chỉnh sửa tên lớp"
        open={!!editingClass}
        onOk={saveEdit} 
        onCancel={() => {
          setEditingClass(null);
          setNewName('');
        }}
        okText="💾 Lưu thay đổi"
        cancelText="❌ Hủy bỏ"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Tên lớp hiện tại: <Text strong>{editingClass?.name}</Text></Text>
          <Input 
            placeholder="Nhập tên lớp mới..."
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            size="large"
          />
        </Space>
      </Modal>

      {/* Modal xem danh sách học sinh */}
      <Modal
        title={`👥 Danh sách học sinh lớp "${selectedClassName}"`}
        open={studentsModalVisible}
        onCancel={() => setStudentsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedStudents.length === 0 ? (
          <Empty 
            description="Chưa có học sinh nào tham gia lớp này"
            style={{ margin: '40px 0' }}
          />
        ) : (
          <List
            dataSource={selectedStudents}
            renderItem={(student, index) => (
              <List.Item style={{ padding: '12px 0' }}>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#52c41a' }}>
                      {index + 1}
                    </Avatar>
                  }
                  title={student.email}
                  description={`ID: ${student._id}`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminClassManagement;