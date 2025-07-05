import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Select, 
  Typography, 
  InputNumber, 
  Card, 
  List, 
  Modal, 
  Steps, 
  Space, 
  Alert, 
  Layout,
  Row,
  Col,
  Divider,
  Tag,
  Empty,
  Tooltip,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  BookOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  WarningOutlined
} from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Content, Header } = Layout;

const AdminCreatePracticeQuestion = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  
  // Exam setup
  const [examSetup, setExamSetup] = useState({
    topic: '',
    duration: null,
    examCode: ''
  });
  
  // Question management
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  
  const [questionList, setQuestionList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateExamSetup = () => {
    return examSetup.topic.trim() && examSetup.duration && examSetup.duration > 0;
  };

  const validateCurrentQuestion = () => {
    return (
      currentQuestion.question.trim() &&
      currentQuestion.options.every(opt => opt.trim()) &&
      currentQuestion.correctAnswer &&
      currentQuestion.options.includes(currentQuestion.correctAnswer)
    );
  };

  // Step handlers
  const handleNextStep = () => {
    if (currentStep === 0 && !validateExamSetup()) {
      Modal.warning({
        title: 'Thông tin chưa đầy đủ',
        content: 'Vui lòng điền đầy đủ thông tin chủ đề và thời gian làm bài.',
        centered: true
      });
      return;
    }
    if (currentStep === 1 && questionList.length === 0) {
      Modal.warning({
        title: 'Chưa có câu hỏi',
        content: 'Vui lòng thêm ít nhất một câu hỏi trước khi tiếp tục.',
        centered: true
      });
      return;
    }
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Exam setup handlers
  const generateExamCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setExamSetup(prev => ({ ...prev, examCode: code }));
    return code;
  };

  const handleExamSetupChange = (field, value) => {
    setExamSetup(prev => ({ ...prev, [field]: value }));
  };

  // Question handlers
  const handleQuestionChange = (field, value, index = null) => {
    if (field === 'options' && index !== null) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: ''
    });
    setEditingIndex(-1);
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQuestion()) {
      Modal.warning({
        title: 'Thông tin câu hỏi chưa đầy đủ',
        content: 'Vui lòng điền đầy đủ nội dung câu hỏi, các lựa chọn và chọn đáp án đúng.',
        centered: true
      });
      return;
    }

    if (editingIndex >= 0) {
      // Update existing question
      const updatedList = [...questionList];
      updatedList[editingIndex] = { ...currentQuestion };
      setQuestionList(updatedList);
      Modal.success({
        title: 'Cập nhật thành công',
        content: 'Câu hỏi đã được cập nhật.',
        duration: 2
      });
    } else {
      // Add new question
      setQuestionList(prev => [...prev, { ...currentQuestion }]);
      Modal.success({
        title: 'Thêm thành công',
        content: 'Câu hỏi đã được thêm vào danh sách.',
        duration: 2
      });
    }

    resetCurrentQuestion();
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...questionList[index] });
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index) => {
    Modal.confirm({
      title: 'Xác nhận xóa câu hỏi',
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.',
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      centered: true,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => {
        const updatedList = questionList.filter((_, i) => i !== index);
        setQuestionList(updatedList);
        if (editingIndex === index) {
          resetCurrentQuestion();
        }
        Modal.success({
          title: 'Xóa thành công',
          content: 'Câu hỏi đã được xóa khỏi danh sách.',
          duration: 2
        });
      }
    });
  };

  // Submit handler
  const handleSubmitAll = async () => {
    if (questionList.length === 0) {
      Modal.warning({
        title: 'Không có câu hỏi',
        content: 'Vui lòng thêm ít nhất một câu hỏi trước khi tạo bài ôn tập.',
        centered: true
      });
      return;
    }

    setIsSubmitting(true);
    
    const finalExamCode = examSetup.examCode || generateExamCode();

    try {
      const response = await fetch('http://localhost:9999/api/practice-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          topic: examSetup.topic,
          examCode: finalExamCode,
          duration: examSetup.duration,
          questions: questionList
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Reset form after success
      setExamSetup({ topic: '', duration: null, examCode: '' });
      setQuestionList([]);
      resetCurrentQuestion();
      setCurrentStep(0);
      
      Modal.success({
        title: 'Tạo bài ôn tập thành công!',
        content: (
          <div>
            <p>Bài ôn tập đã được tạo thành công với {questionList.length} câu hỏi.</p>
            <p><strong>Mã bài:</strong> <Tag color="blue">{finalExamCode}</Tag></p>
          </div>
        ),
        centered: true
      });
    } catch (error) {
      console.error('Error:', error);
      Modal.error({
        title: 'Có lỗi xảy ra',
        content: 'Không thể tạo bài ôn tập. Vui lòng kiểm tra kết nối mạng và thử lại.',
        centered: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <span>Thiết lập thông tin bài ôn tập</span>
                </div>
              }
              style={{ 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: 12,
                border: 'none'
              }}
              bodyStyle={{ padding: 32 }}
            >
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16, color: '#262626' }}>
                      Chủ đề bài ôn tập <Text style={{ color: '#ff4d4f' }}>*</Text>
                    </Text>
                  </div>
                  <Input
                    placeholder="Ví dụ: Toán học lớp 10, Tiếng Anh cơ bản, Lịch sử Việt Nam..."
                    value={examSetup.topic}
                    onChange={e => handleExamSetupChange('topic', e.target.value)}
                    size="large"
                    prefix={<BookOutlined style={{ color: '#8c8c8c' }} />}
                    style={{ borderRadius: 8 }}
                  />
                </Col>
                
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16, color: '#262626' }}>
                      Thời gian làm bài <Text style={{ color: '#ff4d4f' }}>*</Text>
                    </Text>
                  </div>
                  <InputNumber
                    min={1}
                    max={300}
                    placeholder="Nhập số phút"
                    value={examSetup.duration}
                    onChange={value => handleExamSetupChange('duration', value)}
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }}
                    prefix={<ClockCircleOutlined style={{ color: '#8c8c8c' }} />}
                    addonAfter="phút"
                  />
                </Col>
                
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16, color: '#262626' }}>
                      Mã bài ôn tập <Text style={{ color: '#8c8c8c' }}>(tùy chọn)</Text>
                    </Text>
                  </div>
                  <Input.Group compact>
                    <Input
                      placeholder="Để trống để tự động tạo mã"
                      value={examSetup.examCode}
                      onChange={e => handleExamSetupChange('examCode', e.target.value)}
                      size="large"
                      style={{ width: 'calc(100% - 120px)', borderRadius: '8px 0 0 8px' }}
                      prefix={<CodeOutlined style={{ color: '#8c8c8c' }} />}
                    />
                    <Button 
                      onClick={generateExamCode} 
                      size="large"
                      style={{ width: 120, borderRadius: '0 8px 8px 0' }}
                    >
                      Tạo mã
                    </Button>
                  </Input.Group>
                </Col>
              </Row>
            </Card>
          </div>
        );

      case 1:
        return (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card 
                  size="small" 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: 12,
                    color: 'white'
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <Row gutter={[16, 8]} align="middle">
                    <Col xs={24} sm={8}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOutlined />
                        <Text strong style={{ color: 'white' }}>
                          {examSetup.topic}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockCircleOutlined />
                        <Text style={{ color: 'white' }}>
                          {examSetup.duration} phút
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CodeOutlined />
                        <Text style={{ color: 'white' }}>
                          {examSetup.examCode || 'Tự động tạo'}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card 
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                        <span>{editingIndex >= 0 ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</span>
                      </div>
                      <Tag color="blue" style={{ margin: 0 }}>
                        {questionList.length} câu hỏi
                      </Tag>
                    </div>
                  }
                  style={{ 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    borderRadius: 12,
                    border: 'none'
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          Nội dung câu hỏi <Text style={{ color: '#ff4d4f' }}>*</Text>
                        </Text>
                      </div>
                      <TextArea
                        rows={4}
                        placeholder="Nhập nội dung câu hỏi của bạn..."
                        value={currentQuestion.question}
                        onChange={e => handleQuestionChange('question', e.target.value)}
                        size="large"
                        style={{ borderRadius: 8 }}
                        showCount
                        maxLength={500}
                      />
                    </Col>

                    <Col span={24}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          Các lựa chọn <Text style={{ color: '#ff4d4f' }}>*</Text>
                        </Text>
                      </div>
                      <Row gutter={[16, 16]}>
                        {currentQuestion.options.map((opt, i) => (
                          <Col span={12} key={i}>
                            <Input
                              placeholder={`Nhập lựa chọn ${String.fromCharCode(65 + i)}`}
                              value={opt}
                              onChange={e => handleQuestionChange('options', e.target.value, i)}
                              size="large"
                              style={{ borderRadius: 8 }}
                              prefix={
                                <div style={{ 
                                  background: '#f0f0f0', 
                                  padding: '2px 8px', 
                                  borderRadius: 4,
                                  fontSize: 12,
                                  fontWeight: 'bold'
                                }}>
                                  {String.fromCharCode(65 + i)}
                                </div>
                              }
                            />
                          </Col>
                        ))}
                      </Row>
                    </Col>

                    <Col span={24}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          Đáp án đúng <Text style={{ color: '#ff4d4f' }}>*</Text>
                        </Text>
                      </div>
                      <Select
                        placeholder="Chọn đáp án đúng"
                        value={currentQuestion.correctAnswer}
                        onChange={value => handleQuestionChange('correctAnswer', value)}
                        size="large"
                        style={{ width: '100%', borderRadius: 8 }}
                        suffixIcon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      >
                        {currentQuestion.options.map((opt, i) => (
                          opt && <Option key={i} value={opt}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Tag color="blue">{String.fromCharCode(65 + i)}</Tag>
                              {opt}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Col>

                    <Col span={24}>
                      <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                        <Button 
                          type="primary"
                          icon={editingIndex >= 0 ? <SaveOutlined /> : <PlusOutlined />}
                          onClick={handleAddQuestion}
                          disabled={!validateCurrentQuestion()}
                          size="large"
                          style={{ borderRadius: 8 }}
                        >
                          {editingIndex >= 0 ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
                        </Button>
                        
                        {editingIndex >= 0 && (
                          <Button 
                            onClick={resetCurrentQuestion} 
                            size="large"
                            style={{ borderRadius: 8 }}
                          >
                            Hủy chỉnh sửa
                          </Button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {questionList.length > 0 && (
                <Col span={24}>
                  <Card 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <EyeOutlined style={{ color: '#1890ff' }} />
                        <span>Danh sách câu hỏi</span>
                        <Tag color="green">{questionList.length} câu</Tag>
                      </div>
                    }
                    style={{ 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderRadius: 12,
                      border: 'none'
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <List
                      dataSource={questionList}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{ 
                            padding: '20px 0',
                            borderBottom: index < questionList.length - 1 ? '1px solid #f0f0f0' : 'none'
                          }}
                          actions={[
                            <Tooltip title="Chỉnh sửa">
                              <Button 
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditQuestion(index)}
                                style={{ color: '#1890ff' }}
                              />
                            </Tooltip>,
                            <Tooltip title="Xóa">
                              <Button 
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteQuestion(index)}
                              />
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Tag color="blue">Câu {index + 1}</Tag>
                                <Text strong style={{ fontSize: 16 }}>
                                  {item.question}
                                </Text>
                              </div>
                            }
                            description={
                              <div style={{ marginTop: 8 }}>
                                <Text type="success">
                                  <CheckCircleOutlined style={{ marginRight: 4 }} />
                                  Đáp án đúng: {item.correctAnswer}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}

              {questionList.length === 0 && (
                <Col span={24}>
                  <Card style={{ textAlign: 'center', padding: 40 }}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có câu hỏi nào"
                    >
                      <Text type="secondary">
                        Hãy thêm câu hỏi đầu tiên cho bài ôn tập của bạn
                      </Text>
                    </Empty>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        );

      case 2:
        return (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Xác nhận thông tin và hoàn thành</span>
                </div>
              }
              style={{ 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: 12,
                border: 'none'
              }}
              bodyStyle={{ padding: 32 }}
            >
              <Alert
                message="Kiểm tra kỹ thông tin trước khi tạo bài ôn tập"
                description="Sau khi tạo thành công, bạn sẽ không thể chỉnh sửa nội dung này."
                type="info"
                showIcon
                style={{ marginBottom: 32, borderRadius: 8 }}
              />

              <Card
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 12,
                  marginBottom: 32
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Title level={4} style={{ color: 'white', marginBottom: 20 }}>
                  Thông tin bài ôn tập
                </Title>
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BookOutlined style={{ color: 'white' }} />
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                          Chủ đề
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: 16 }}>
                          {examSetup.topic}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClockCircleOutlined style={{ color: 'white' }} />
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                          Thời gian
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: 16 }}>
                          {examSetup.duration} phút
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CodeOutlined style={{ color: 'white' }} />
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                          Mã bài
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: 16 }}>
                          {examSetup.examCode || 'Tự động tạo'}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <QuestionCircleOutlined style={{ color: 'white' }} />
                      <div>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                          Số câu hỏi
                        </Text>
                        <Text strong style={{ color: 'white', fontSize: 16 }}>
                          {questionList.length} câu
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  onClick={handleSubmitAll}
                  disabled={questionList.length === 0}
                  icon={<CheckCircleOutlined />}
                  style={{ 
                    height: 56,
                    padding: '0 48px',
                    fontSize: 16,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  {isSubmitting ? 'Đang tạo bài ôn tập...' : `Tạo bài ôn tập (${questionList.length} câu hỏi)`}
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <AdminSidebar selectedKey="exams" setSelectedKey={() => {}} />
      <Layout style={{ padding: '24px' }}>
        <Content
          style={{
            background: '#fff',
            padding: 32,
            borderRadius: 16,
            minHeight: 'calc(100vh - 48px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              🎯 Tạo Bài Ôn Tập Trắc Nghiệm
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#8c8c8c', marginTop: 8 }}>
              Tạo bài ôn tập với nhiều câu hỏi trắc nghiệm một cách dễ dàng và hiệu quả
            </Paragraph>
          </div>

          {/* Steps */}
          <div style={{ maxWidth: 600, margin: '0 auto 48px' }}>
            <Steps 
              current={currentStep} 
              size="default"
              style={{ padding: '0 24px' }}
            >
              <Step 
                title="Thiết lập" 
                description="Thông tin cơ bản"
                icon={<BookOutlined />}
              />
              <Step 
                title="Câu hỏi" 
                description="Thêm câu hỏi"
                icon={<QuestionCircleOutlined />}
              />
              <Step 
                title="Hoàn thành" 
                description="Xác nhận và gửi"
                icon={<CheckCircleOutlined />}
              />
            </Steps>
            
            {/* Progress bar */}
            <div style={{ marginTop: 24 }}>
              <Progress 
                percent={Math.round((currentStep / 2) * 100)} 
                showInfo={false}
                strokeColor={{
                  '0%': '#667eea',
                  '100%': '#764ba2'
                }}
                trailColor="#f0f0f0"
                strokeWidth={6}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{ minHeight: 500, marginBottom: 48 }}>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div style={{ 
            borderTop: '1px solid #f0f0f0', 
            paddingTop: 24,
            background: '#fafafa',
            margin: '0 -32px -32px',
            padding: '24px 32px',
            borderRadius: '0 0 16px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              maxWidth: 1200,
              margin: '0 auto'
            }}>
              <Button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                size="large"
                icon={<ArrowLeftOutlined />}
                style={{ borderRadius: 8 }}
              >
                Quay lại
              </Button>

              <div style={{ display: 'flex', gap: 16 }}>
                {currentStep === 1 && questionList.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    type="primary"
                    size="large"
                    icon={<EyeOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    Xem trước và hoàn thành
                  </Button>
                )}

                {currentStep < 2 && (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={currentStep === 0 && !validateExamSetup()}
                    size="large"
                    icon={<ArrowRightOutlined />}
                    style={{ borderRadius: 8 }}
                  >
                    Tiếp tục
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminCreatePracticeQuestion;