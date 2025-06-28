import React, { useState } from 'react';
import { Input, Button, Select, Typography, Divider, InputNumber, Card, List, Modal, Steps, Space, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;

const CreatePracticeQuestion = () => {
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
      return;
    }

    if (editingIndex >= 0) {
      // Update existing question
      const updatedList = [...questionList];
      updatedList[editingIndex] = { ...currentQuestion };
      setQuestionList(updatedList);
    } else {
      // Add new question
      setQuestionList(prev => [...prev, { ...currentQuestion }]);
    }

    resetCurrentQuestion();
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...questionList[index] });
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      onOk: () => {
        const updatedList = questionList.filter((_, i) => i !== index);
        setQuestionList(updatedList);
        if (editingIndex === index) {
          resetCurrentQuestion();
        }
      }
    });
  };

  // Submit handler
  const handleSubmitAll = async () => {
    if (questionList.length === 0) {
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
        title: 'Thành công',
        content: `Đã tạo bài ôn tập với ${questionList.length} câu hỏi. Mã bài: ${finalExamCode}`
      });
    } catch (error) {
      console.error('Error:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Có lỗi xảy ra khi tạo bài ôn tập. Vui lòng thử lại.'
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
          <Card 
            title="Thiết lập bài ôn tập" 
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <Text strong className="text-base mb-3 block">Chủ đề bài ôn tập *</Text>
                <Input
                  placeholder="Nhập chủ đề (VD: Toán học lớp 10, Tiếng Anh cơ bản...)"
                  value={examSetup.topic}
                  onChange={e => handleExamSetupChange('topic', e.target.value)}
                  size="large"
                />
              </div>
              
              <div className="mb-8">
                <Text strong className="text-base mb-3 block">Thời gian làm bài (phút) *</Text>
                <InputNumber
                  min={1}
                  max={300}
                  placeholder="Nhập thời gian"
                  value={examSetup.duration}
                  onChange={value => handleExamSetupChange('duration', value)}
                  size="large"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div className="mb-6">
                <Text strong className="text-base mb-3 block">Mã bài ôn tập (tùy chọn)</Text>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Input
                    placeholder="Để trống để tự động tạo mã"
                    value={examSetup.examCode}
                    onChange={e => handleExamSetupChange('examCode', e.target.value)}
                    size="large"
                    style={{ flex: 1 }}
                  />
                  <Button onClick={generateExamCode} size="large">Tạo mã</Button>
                </div>
              </div>
            </div>
          </Card>
        );

      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card 
              size="small" 
              style={{ 
                background: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                alignItems: 'center'
              }}>
                <div><Text strong>Chủ đề:</Text> <Text>{examSetup.topic}</Text></div>
                <div><Text strong>Thời gian:</Text> <Text>{examSetup.duration} phút</Text></div>
                <div><Text strong>Mã bài:</Text> <Text>{examSetup.examCode || 'Tự động tạo'}</Text></div>
              </div>
            </Card>

            <Card 
              title={`${editingIndex >= 0 ? 'Chỉnh sửa' : 'Thêm'} câu hỏi`}
              extra={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Đã có {questionList.length} câu hỏi
                </Text>
              }
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <Text strong className="text-base mb-3 block">Nội dung câu hỏi *</Text>
                  <TextArea
                    rows={4}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={currentQuestion.question}
                    onChange={e => handleQuestionChange('question', e.target.value)}
                    size="large"
                  />
                </div>

                <div>
                  <Text strong className="text-base mb-3 block">Các lựa chọn *</Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentQuestion.options.map((opt, i) => (
                      <Input
                        key={i}
                        placeholder={`Nhập lựa chọn ${String.fromCharCode(65 + i)}`}
                        value={opt}
                        onChange={e => handleQuestionChange('options', e.target.value, i)}
                        prefix={<Text strong style={{ minWidth: '20px' }}>{String.fromCharCode(65 + i)}.</Text>}
                        size="large"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Text strong className="text-base mb-3 block">Đáp án đúng *</Text>
                  <Select
                    placeholder="Chọn đáp án đúng"
                    value={currentQuestion.correctAnswer}
                    onChange={value => handleQuestionChange('correctAnswer', value)}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {currentQuestion.options.map((opt, i) => (
                      opt && <Option key={i} value={opt}>
                        {String.fromCharCode(65 + i)}. {opt}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <Button 
                    type="primary"
                    icon={editingIndex >= 0 ? <EditOutlined /> : <PlusOutlined />}
                    onClick={handleAddQuestion}
                    disabled={!validateCurrentQuestion()}
                    size="large"
                  >
                    {editingIndex >= 0 ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
                  </Button>
                  
                  {editingIndex >= 0 && (
                    <Button onClick={resetCurrentQuestion} size="large">
                      Hủy chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {questionList.length > 0 && (
              <Card 
                title={`Danh sách câu hỏi (${questionList.length})`}
                style={{ 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <List
                  dataSource={questionList}
                  renderItem={(item, index) => (
                    <List.Item
                      style={{ 
                        padding: '16px 0',
                        borderBottom: index < questionList.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                      actions={[
                        <Button 
                          size="default" 
                          icon={<EditOutlined />}
                          onClick={() => handleEditQuestion(index)}
                        >
                          Sửa
                        </Button>,
                        <Button 
                          size="default" 
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteQuestion(index)}
                        >
                          Xóa
                        </Button>
                      ]}
                    >
                      <div style={{ flex: 1, marginRight: '16px' }}>
                        <Text strong style={{ fontSize: '16px' }}>Câu {index + 1}:</Text>
                        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                          {item.question}
                        </div>
                        <div style={{ fontSize: '14px', color: '#52c41a' }}>
                          <Text type="success">Đáp án đúng: {item.correctAnswer}</Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <Card 
            title="Xác nhận và hoàn thành"
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}
          >
            <div className="max-w-3xl mx-auto">
              <div style={{ marginBottom: '32px' }}>
                <Alert
                  message="Kiểm tra thông tin trước khi gửi"
                  description="Sau khi tạo bài ôn tập, bạn sẽ không thể chỉnh sửa nội dung này."
                  type="info"
                  showIcon
                  style={{ padding: '16px 20px' }}
                />
              </div>

              <div style={{ 
                background: '#fafafa', 
                padding: '24px', 
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                marginBottom: '32px'
              }}>
                <Title level={4} style={{ marginBottom: '20px', color: '#1890ff' }}>
                  Thông tin bài ôn tập
                </Title>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '20px'
                }}>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Chủ đề:</Text>
                    <Text style={{ fontSize: '16px' }}>{examSetup.topic}</Text>
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Thời gian:</Text>
                    <Text style={{ fontSize: '16px' }}>{examSetup.duration} phút</Text>
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Mã bài:</Text>
                    <Text style={{ fontSize: '16px' }}>{examSetup.examCode || 'Tự động tạo'}</Text>
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Số câu hỏi:</Text>
                    <Text style={{ fontSize: '16px', color: '#52c41a' }}>{questionList.length} câu</Text>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                <Button
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  onClick={handleSubmitAll}
                  disabled={questionList.length === 0}
                  icon={<CheckCircleOutlined />}
                  style={{ 
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                >
                  {isSubmitting ? 'Đang tạo bài ôn tập...' : `Tạo bài ôn tập (${questionList.length} câu hỏi)`}
                </Button>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-12">
        <Title level={2} className="text-center mb-4">
          Tạo Bài Ôn Tập Trắc Nghiệm
        </Title>
        <div className="text-center text-gray-600 mb-8">
          Tạo bài ôn tập với nhiều câu hỏi trắc nghiệm một cách dễ dàng
        </div>
      </div>

      <div className="mb-12">
        <Steps current={currentStep} size="default">
          <Step title="Thiết lập" description="Thông tin cơ bản" />
          <Step title="Câu hỏi" description="Thêm câu hỏi" />
          <Step title="Hoàn thành" description="Xác nhận và gửi" />
        </Steps>
      </div>

      <div className="min-h-[500px] mb-12">
        {renderStepContent()}
      </div>

      <div className="border-t pt-8">
        <div className="flex justify-between items-center">
          <Button 
            onClick={handlePrevStep} 
            disabled={currentStep === 0}
            size="large"
          >
            Quay lại
          </Button>

          <Space size="large">
            {currentStep === 1 && questionList.length > 0 && (
              <Button 
                onClick={() => setCurrentStep(2)}
                type="primary"
                size="large"
              >
                Xem trước và gửi
              </Button>
            )}
            
            {currentStep < 2 && (
              <Button 
                type="primary"
                onClick={handleNextStep}
                disabled={currentStep === 0 && !validateExamSetup()}
                size="large"
              >
                Tiếp tục
              </Button>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default CreatePracticeQuestion;