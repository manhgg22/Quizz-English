import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Card, 
  Typography, Row, Col, Divider, Tooltip, Badge, Empty, Spin, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  QuestionCircleOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ReloadOutlined, FilterOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API = 'http://localhost:9999/api/practice-questions';

const AdminQuestionManager = ({ examCode }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [form] = Form.useForm();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/list/${examCode}`, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      message.error('Không thể tải câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examCode) fetchQuestions();
  }, [examCode]);

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/${id}?examCode=${examCode}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message);
        fetchQuestions();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Lỗi xoá câu hỏi');
    }
  };

  const handleSubmit = async (values) => {
    const payload = { ...values, examCode };

    const url = editing ? `${API}/${editing._id}` : `${API}/add-one`;
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        message.success(data.message);
        setOpenModal(false);
        setEditing(null);
        form.resetFields();
        fetchQuestions();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      message.error('Lỗi khi lưu câu hỏi');
    }
  };

  // Get unique topics for filter
  const uniqueTopics = [...new Set(questions.map(q => q.topic))].filter(Boolean);

  // Filter questions based on search and topic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchText || 
      q.question.toLowerCase().includes(searchText.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchText.toLowerCase());
    const matchesTopic = !selectedTopic || q.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => (
        <Badge count={index + 1} showZero color="#108ee9" />
      )
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'question',
      key: 'question',
      ellipsis: {
        showTitle: false,
      },
      render: text => (
        <Tooltip title={text} placement="topLeft">
          <div style={{ maxWidth: 300 }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {text}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Chủ đề',
      dataIndex: 'topic',
      key: 'topic',
      width: 120,
      render: topic => topic ? (
        <Tag color="blue" icon={<BookOutlined />}>
          {topic}
        </Tag>
      ) : (
        <Tag color="default">Chưa có</Tag>
      )
    },
    {
      title: 'Đáp án',
      dataIndex: 'options',
      key: 'options',
      width: 200,
      render: options => {
        if (!options || typeof options !== 'string') {
          return <Tag color="default">Chưa có</Tag>;
        }
        const optionList = options.split('|').map(opt => opt.trim()).filter(Boolean);
        if (optionList.length === 0) {
          return <Tag color="default">Chưa có</Tag>;
        }
        return (
          <div>
            {optionList.slice(0, 2).map((opt, idx) => (
              <Tag key={idx} color="geekblue" style={{ marginBottom: 4 }}>
                {opt.length > 20 ? `${opt.substring(0, 20)}...` : opt}
              </Tag>
            ))}
            {optionList.length > 2 && (
              <Tooltip title={optionList.slice(2).join(', ')}>
                <Tag color="default">+{optionList.length - 2} khác</Tag>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      title: 'Đáp án đúng',
      dataIndex: 'correctAnswer',
      key: 'correctAnswer',
      width: 150,
      render: val => (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          {val}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: d => (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          {d} phút
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xoá"
            description="Bạn chắc chắn muốn xoá câu hỏi này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
            okType="danger"
          >
            <Tooltip title="Xoá">
              <Button 
                danger 
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <BookOutlined style={{ marginRight: 12 }} />
            Quản lý câu hỏi {examCode && `- ${examCode}`}
          </Title>
          <Text type="secondary">
            Tổng cộng {questions.length} câu hỏi
          </Text>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo chủ đề"
              value={selectedTopic}
              onChange={setSelectedTopic}
              style={{ width: '100%' }}
              allowClear
            >
              {uniqueTopics.map(topic => (
                <Option key={topic} value={topic}>
                  <BookOutlined style={{ marginRight: 8 }} />
                  {topic}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditing(null);
                  form.resetFields();
                  setOpenModal(true);
                }}
              >
                Thêm câu hỏi
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchQuestions}
                loading={loading}
              >
                Tải lại
              </Button>
            </Space>
          </Col>
        </Row>

        {!examCode && (
          <Alert
            message="Chưa chọn mã đề thi"
            description="Vui lòng chọn mã đề thi để quản lý câu hỏi"
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={filteredQuestions}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} câu hỏi`
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: filteredQuestions.length === 0 && questions.length > 0 ? 
              <Empty description="Không tìm thấy câu hỏi phù hợp" /> :
              <Empty description="Chưa có câu hỏi nào" />
          }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {editing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
          </div>
        }
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          form.resetFields();
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText={editing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Huỷ"
        width={800}
        destroyOnClose
      >
        <Divider />
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            label={
              <span>
                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                Nội dung câu hỏi
              </span>
            }
            name="question"
            rules={[
              { required: true, message: 'Vui lòng nhập câu hỏi!' },
              { min: 10, message: 'Câu hỏi phải có ít nhất 10 ký tự!' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nội dung câu hỏi..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    <BookOutlined style={{ marginRight: 8 }} />
                    Chủ đề
                  </span>
                }
                name="topic"
                rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
              >
                <Select
                  placeholder="Chọn hoặc nhập chủ đề"
                  showSearch
                  allowClear
                  mode="tags"
                  maxTagCount={1}
                >
                  {uniqueTopics.map(topic => (
                    <Option key={topic} value={topic}>{topic}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    Thời gian (phút)
                  </span>
                }
                name="duration"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời gian!' },
                  { type: 'number', min: 1, max: 60, message: 'Thời gian từ 1-60 phút!' }
                ]}
              >
                <Input 
                  type="number" 
                  min={1} 
                  max={60}
                  placeholder="Ví dụ: 3"
                  suffix="phút"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span>
                Các đáp án
                <Tooltip title="Nhập các đáp án cách nhau bởi dấu | (pipe)">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </span>
            }
            name="options"
            rules={[
              { required: true, message: 'Vui lòng nhập đáp án!' },
              {
                validator: (_, value) => {
                  if (!value || typeof value !== 'string') return Promise.resolve();
                  const options = value.split('|').map(opt => opt.trim()).filter(Boolean);
                  if (options.length < 2) {
                    return Promise.reject(new Error('Cần ít nhất 2 đáp án!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Ví dụ: Đáp án A | Đáp án B | Đáp án C | Đáp án D"
              showCount
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Đáp án đúng
              </span>
            }
            name="correctAnswer"
            rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
          >
            <Input 
              placeholder="Nhập đáp án đúng (phải khớp với một trong các đáp án ở trên)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminQuestionManager;