import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, message, Popconfirm, Tag, Card, 
  Typography, Row, Col, Divider, Tooltip, Badge, Empty, Spin, Alert, 
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  QuestionCircleOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ReloadOutlined, FilterOutlined,ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation,useParams  } from 'react-router-dom';

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
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  
//   navigate(`api/practice-questions/${examCode}`, {
//   state: { from: 'topic-management' }
// });
const handleBack = () => {
  if (location.state?.from === 'topic-management') {
    navigate('/admin/exams'); // ← đây là route của trang Quản lý chủ đề & mã đề
  } else {
    navigate(-1); // fallback nếu không có state
  }
};


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

  const handleView = (record) => {
    setSelectedQuestion(record);
    setViewDetailModal(true);
  };

  const handleEdit = (record) => {
  const formValues = { ...record };

  const optionList = Array.isArray(record.options)
    ? record.options
    : (typeof record.options === 'string'
        ? record.options.split('|').map(opt => opt.trim()).filter(Boolean)
        : []);

  formValues.optionA = optionList[0] || '';
  formValues.optionB = optionList[1] || '';
  formValues.optionC = optionList[2] || '';
  formValues.optionD = optionList[3] || '';

  form.setFieldsValue(formValues);
  setEditing(record);
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
    // Chuyển đổi từ 4 input riêng thành format string
  const options = [
  values.optionA?.trim(),
  values.optionB?.trim(),
  values.optionC?.trim(),
  values.optionD?.trim()
];


    const payload = { 
      ...values, 
      examCode,
      options
    };

    // Xóa các field không cần thiết
    delete payload.optionA;
    delete payload.optionB;
    delete payload.optionC;
    delete payload.optionD;

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
      render: (text, record) => (
        <Tooltip title="Nhấn để xem chi tiết" placement="topLeft">
          <div 
            style={{ 
              maxWidth: 300, 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f8ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            onClick={() => handleView(record)}
          >
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
      width: 150,
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
      width: 250,
      render: (options, record) => {
        if (!options || typeof options !== 'string') {
          return <Tag color="default">Chưa có</Tag>;
        }
        
        const optionList = Array.isArray(options)
          ? options
          : (typeof options === 'string'
              ? options.split('|').map(opt => opt.trim()).filter(Boolean)
              : []);

        if (optionList.length === 0) {
          return <Tag color="default">Chưa có</Tag>;
        }

        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const correctAnswer = record.correctAnswer;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {optionList.map((opt, idx) => {
              const isCorrect = opt === correctAnswer;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge 
                    count={letters[idx]} 
                    style={{ 
                      backgroundColor: isCorrect ? '#52c41a' : '#1890ff',
                      fontSize: '12px',
                      minWidth: '20px',
                      height: '20px',
                      lineHeight: '20px'
                    }} 
                  />
                  <span style={{ 
                    fontSize: '13px',
                    fontWeight: isCorrect ? 'bold' : 'normal',
                    color: isCorrect ? '#52c41a' : '#666',
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {opt}
                  </span>
                  {isCorrect && (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                  )}
                </div>
              );
            })}
          </div>
        );
      }
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
          <Tooltip title="Xem chi tiết">
            <Button 
              type="default" 
              size="small"
              icon={<QuestionCircleOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
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
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
    <Button 
      icon={<ArrowLeftOutlined />} 
      onClick={handleBack}
      style={{ marginRight: 16 }}
    >
      Quay lại
    </Button>

    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
      <BookOutlined style={{ marginRight: 12 }} />
      Quản lý câu hỏi {examCode && `- ${examCode}`}
    </Title>
  </div>

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
        width={1000}
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

          {/* Các đáp án riêng biệt */}
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
              Các đáp án:
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}>
                        A
                      </div>
                      Đáp án A
                    </div>
                  }
                  name="optionA"
                  rules={[{ required: true, message: 'Vui lòng nhập đáp án A!' }]}
                >
                  <Input placeholder="Nhập đáp án A..." />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}>
                        B
                      </div>
                      Đáp án B
                    </div>
                  }
                  name="optionB"
                  rules={[{ required: true, message: 'Vui lòng nhập đáp án B!' }]}
                >
                  <Input placeholder="Nhập đáp án B..." />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}>
                        C
                      </div>
                      Đáp án C
                    </div>
                  }
                  name="optionC"
                  rules={[{ required: true, message: 'Vui lòng nhập đáp án C!' }]}
                >
                  <Input placeholder="Nhập đáp án C..." />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1890ff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}>
                        D
                      </div>
                      Đáp án D
                    </div>
                  }
                  name="optionD"
                  rules={[{ required: true, message: 'Vui lòng nhập đáp án D!' }]}
                >
                  <Input placeholder="Nhập đáp án D..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item
            label={
              <span>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Đáp án đúng
              </span>
            }
            name="correctAnswer"
            rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
          >
            <Select placeholder="Chọn đáp án đúng">
              <Option value={form.getFieldValue('optionA')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count="A" style={{ backgroundColor: '#52c41a', marginRight: '8px' }} />
                  {form.getFieldValue('optionA') || 'Đáp án A'}
                </div>
              </Option>
              <Option value={form.getFieldValue('optionB')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count="B" style={{ backgroundColor: '#52c41a', marginRight: '8px' }} />
                  {form.getFieldValue('optionB') || 'Đáp án B'}
                </div>
              </Option>
              <Option value={form.getFieldValue('optionC')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count="C" style={{ backgroundColor: '#52c41a', marginRight: '8px' }} />
                  {form.getFieldValue('optionC') || 'Đáp án C'}
                </div>
              </Option>
              <Option value={form.getFieldValue('optionD')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Badge count="D" style={{ backgroundColor: '#52c41a', marginRight: '8px' }} />
                  {form.getFieldValue('optionD') || 'Đáp án D'}
                </div>
              </Option>
            </Select>
          </Form.Item>

          {/* Preview đáp án */}
          <Form.Item shouldUpdate={(prevValues, currentValues) => {
            return prevValues.optionA !== currentValues.optionA ||
                   prevValues.optionB !== currentValues.optionB ||
                   prevValues.optionC !== currentValues.optionC ||
                   prevValues.optionD !== currentValues.optionD ||
                   prevValues.correctAnswer !== currentValues.correctAnswer;
          }}>
            {({ getFieldValue }) => {
              const optionA = getFieldValue('optionA');
              const optionB = getFieldValue('optionB');
              const optionC = getFieldValue('optionC');
              const optionD = getFieldValue('optionD');
              const correctAnswer = getFieldValue('correctAnswer');

              const options = [optionA, optionB, optionC, optionD].filter(Boolean);
              
              if (options.length === 0) {
                return null;
              }

              return (
                <div style={{ marginTop: 24 }}>
                  <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                    Xem trước các đáp án:
                  </Title>
                  
                  <Row gutter={[16, 16]}>
                    {[
                      { value: optionA, letter: 'A' },
                      { value: optionB, letter: 'B' },
                      { value: optionC, letter: 'C' },
                      { value: optionD, letter: 'D' }
                    ].map(({ value, letter }, index) => {
                      if (!value) return null;
                      
                      const isCorrect = value === correctAnswer;
                      return (
                        <Col key={index} xs={24} sm={12}>
                          <div style={{
                            padding: '16px',
                            borderRadius: '8px',
                            border: `2px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
                            backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
                            position: 'relative',
                            minHeight: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '-12px',
                              left: '16px',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isCorrect ? '#52c41a' : '#1890ff',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}>
                              {letter}
                            </div>
                            <div style={{
                              marginLeft: '16px',
                              flex: 1,
                              fontSize: '14px',
                              color: isCorrect ? '#52c41a' : '#333',
                              fontWeight: isCorrect ? 'bold' : 'normal',
                              wordBreak: 'break-word'
                            }}>
                              {value}
                            </div>
                            {isCorrect && (
                              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                              </div>
                            )}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết câu hỏi */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <QuestionCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Chi tiết câu hỏi
          </div>
        }
        open={viewDetailModal}
        onCancel={() => setViewDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewDetailModal(false)}>
            Đóng
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setViewDetailModal(false);
              handleEdit(selectedQuestion);
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={800}
      >
        {selectedQuestion && (
          <div style={{ padding: '16px 0' }}>
            {/* Thông tin câu hỏi */}
            <div style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      <BookOutlined style={{ marginRight: 8 }} />
                      Chủ đề:
                    </Text>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {selectedQuestion.topic || 'Chưa có'}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      Thời gian:
                    </Text>
                    <Tag color="orange" style={{ marginLeft: 8 }}>
                      {selectedQuestion.duration} phút
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Câu hỏi */}
             <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                <QuestionCircleOutlined style={{ marginRight: 8 }} />
                Câu hỏi:
              </Title>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f0f8ff', 
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                {selectedQuestion.question}
              </div>
            </div>

            {/* Các phương án */}
            <div>
              <Title level={4} style={{ color: '#1890ff', marginBottom: 16 }}>
                Các phương án:
              </Title>
              
              {(() => {
  const { options, correctAnswer } = selectedQuestion;

  if (!options || (!Array.isArray(options) && typeof options !== 'string')) {
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <Empty description="Chưa có phương án" />
      </div>
    );
  }

  const optionList = Array.isArray(options)
    ? options
    : options.split('|').map(opt => opt.trim()).filter(Boolean);

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Row gutter={[16, 16]}>
      {optionList.map((option, index) => {
        const isCorrect = option.trim() === correctAnswer.trim();
        return (
          <Col key={index} xs={24} sm={12}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: `2px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
              backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
              position: 'relative',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isCorrect ? '#52c41a' : '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {letters[index]}
              </div>
              <div style={{
                marginLeft: '16px',
                flex: 1,
                fontSize: '15px',
                color: isCorrect ? '#52c41a' : '#333',
                fontWeight: isCorrect ? 'bold' : 'normal'
              }}>
                {option}
              </div>
              {isCorrect && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                </div>
              )}
            </div>
          </Col>
        );
      })}
    </Row>
  );
})()}

            </div>

            {/* Đáp án đúng */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '6px'
              }}>
                <Text strong style={{ color: '#52c41a' }}>
                  <CheckCircleOutlined style={{ marginRight: 8 }} />
                  Đáp án đúng: {selectedQuestion.correctAnswer}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
    
  );
};

export default AdminQuestionManager;