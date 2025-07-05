import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { 
  Card, 
  Button, 
  Input, 
  message, 
  Typography, 
  Space, 
  Layout,
  Row,
  Col,
  Tag,
  Empty,
  Spin,
  Modal,
  Form,
  Alert
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const API_BASE_URL = 'http://localhost:9999';

const AdminTopicManager = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();

  // Fetch all distinct topics
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-questions/topics`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách chủ đề.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Open edit modal
  const handleEditClick = (topic) => {
    setEditingTopic(topic);
    form.setFieldsValue({ newName: topic });
    setEditModalVisible(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (values) => {
    if (!values.newName.trim()) {
      message.warning('Tên chủ đề không được để trống');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-questions/topics/${encodeURIComponent(editingTopic)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ newName: values.newName })
      });

      const result = await response.json();
      if (response.ok) {
        message.success(result.message || 'Đổi tên thành công');
        setEditModalVisible(false);
        setEditingTopic(null);
        form.resetFields();
        fetchTopics();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi đổi tên chủ đề');
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (topicName) => {
    confirm({
      title: 'Xác nhận xóa chủ đề',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <Alert
            message="Cảnh báo!"
            description={
              <div>
                <p>Bạn có chắc chắn muốn xóa chủ đề <strong>"{topicName}"</strong>?</p>
                <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
                  <WarningOutlined style={{ marginRight: 4 }} />
                  Hành động này không thể hoàn tác và sẽ ảnh hưởng đến tất cả câu hỏi thuộc chủ đề này.
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: () => handleDelete(topicName),
    });
  };

  // Delete topic
  const handleDelete = async (topicName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-questions/topics/${encodeURIComponent(topicName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      const result = await response.json();
      if (response.ok) {
        message.success(result.message || 'Đã xóa chủ đề');
        fetchTopics();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi xóa chủ đề');
    }
  };

  const renderTopicCard = (topic) => (
    <Card 
      key={topic}
      size="small"
      style={{ 
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
      bodyStyle={{ padding: '16px' }}
      hoverable
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Space>
            <Tag color="blue" icon={<TagOutlined />}>
              {topic}
            </Tag>
          </Space>
        </div>
        
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            ghost
            onClick={() => handleEditClick(topic)}
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteClick(topic)}
          >
            Xóa
          </Button>
        </Space>
      </div>
    </Card>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar selectedKey="topics" setSelectedKey={() => {}} />
      <Layout>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Title level={3} style={{ margin: 0 }}>
                    <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    Quản lý chủ đề
                  </Title>
                  <Text type="secondary">
                    Tổng cộng {topics.length} chủ đề
                  </Text>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchTopics}
                    loading={loading}
                    type="primary"
                  >
                    Tải lại
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Topics List */}
            <Card 
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: '24px' }}
            >
              <Spin spinning={loading}>
                {topics.length === 0 ? (
                  <Empty 
                    description="Chưa có chủ đề nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div>
                    {topics.map(topic => renderTopicCard(topic))}
                  </div>
                )}
              </Spin>
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Edit Modal */}
      <Modal
        title={
          <div>
            <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Sửa tên chủ đề
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTopic(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="Tên chủ đề hiện tại"
          >
            <Input value={editingTopic} disabled />
          </Form.Item>
          
          <Form.Item
            label="Tên chủ đề mới"
            name="newName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chủ đề mới' },
              { min: 1, message: 'Tên chủ đề phải có ít nhất 1 ký tự' },
              { max: 100, message: 'Tên chủ đề không được vượt quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên chủ đề mới" />
          </Form.Item>

          <Alert
            message="Lưu ý"
            description="Việc đổi tên chủ đề sẽ ảnh hưởng đến tất cả câu hỏi thuộc chủ đề này."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminTopicManager;