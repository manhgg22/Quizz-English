import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import {
  Card, Button, Input, message, Typography, Space, Layout,
  Row, Col, Tag, Empty, Spin, Modal, Form, Alert
} from 'antd';
import {
  EditOutlined, DeleteOutlined, ReloadOutlined,
  TagOutlined, ExclamationCircleOutlined, WarningOutlined
} from '@ant-design/icons';
import AdminQuestionManager from '../pages/AdminQuestionManager';

const { Title, Text } = Typography;
const { Content } = Layout;
const { confirm } = Modal;

const API_BASE_URL = 'http://localhost:9999';

const AdminTopicManager = () => {
  const [topicList, setTopicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form] = Form.useForm();

  // ✅ State quản lý xem chi tiết đề
  const [selectedExamCode, setSelectedExamCode] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/practice-questions/`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      setTopicList(data.exams || []);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách chủ đề và mã đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleEditClick = (topic) => {
    setEditingTopic(topic);
    form.setFieldsValue({ newName: topic });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    const newName = values.newName.trim();
    if (!newName) {
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
        body: JSON.stringify({ newName })
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

  const handleDeleteClick = (topic, examCode) => {
    confirm({
      title: `Xác nhận xóa chủ đề "${topic}" và mã đề "${examCode}"?`,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <Alert
          message="Cảnh báo!"
          description={
            <div>
              <p>Xóa toàn bộ câu hỏi thuộc chủ đề <strong>{topic}</strong> và mã đề <strong>{examCode}</strong>.</p>
              <p style={{ color: '#ff4d4f' }}>
                <WarningOutlined style={{ marginRight: 4 }} />
                Hành động này không thể hoàn tác.
              </p>
            </div>
          }
          type="warning"
          showIcon
        />
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(topic, examCode),
    });
  };

  const handleDelete = async (topic, examCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/practice-questions/combo-delete?topic=${encodeURIComponent(topic)}&examCode=${encodeURIComponent(examCode)}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      const result = await response.json();
      if (response.ok) {
        message.success(result.message || 'Đã xoá chủ đề + mã đề');
        fetchTopics();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi xoá');
    }
  };

  const renderTopicCard = (item) => (
    <Card
      key={`${item.topic}-${item.examCode}`}
      size="small"
      hoverable
      onClick={() => {
        setSelectedExamCode(item.examCode);
        setSelectedTopic(item.topic);
      }}
      style={{
        marginBottom: 12,
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      }}
    >
      <Row justify="space-between" align="middle">
        <Col flex="auto">
          <Space direction="vertical">
            <Tag icon={<TagOutlined />} color="blue">{item.topic}</Tag>
            <Text code>Mã đề: {item.examCode}</Text>
            <Text type="secondary">
              Câu hỏi: {item.totalQuestions} | Thời gian: {item.duration} phút
            </Text>
          </Space>
        </Col>
        <Col>
          <Space size="small">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(item.topic);
              }}
            >
              Sửa
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(item.topic, item.examCode);
              }}
            >
              Xóa
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // ✅ Giao diện chính
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar selectedKey="topics" setSelectedKey={() => {}} />
      <Layout>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {!selectedExamCode ? (
              <>
                {/* Header */}
                <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Title level={3} style={{ margin: 0 }}>
                        <TagOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        Quản lý chủ đề & mã đề
                      </Title>
                      <Text type="secondary">
                        Tổng cộng {topicList.length} nhóm
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

                {/* Danh sách đề */}
                <Card style={{ borderRadius: 12 }}>
                  <Spin spinning={loading}>
                    {topicList.length === 0 ? (
                      <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <div>{topicList.map(renderTopicCard)}</div>
                    )}
                  </Spin>
                </Card>
              </>
            ) : (
              // ✅ Hiển thị AdminQuestionManager khi đã chọn đề
              <AdminQuestionManager
                examCode={selectedExamCode}
                topic={selectedTopic}
                onBack={() => {
                  setSelectedExamCode(null);
                  setSelectedTopic(null);
                  fetchTopics();
                }}
              />
            )}
          </div>
        </Content>
      </Layout>

      {/* Modal sửa */}
      <Modal
        title={<><EditOutlined style={{ marginRight: 8 }} />Sửa chủ đề</>}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingTopic(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item label="Tên chủ đề hiện tại">
            <Input value={editingTopic} disabled />
          </Form.Item>
          <Form.Item
            label="Tên chủ đề mới"
            name="newName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên mới' },
              { min: 1, message: 'Ít nhất 1 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên chủ đề mới" />
          </Form.Item>
          <Alert
            message="Lưu ý"
            description="Đổi tên sẽ áp dụng với tất cả mã đề có cùng chủ đề."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminTopicManager;
