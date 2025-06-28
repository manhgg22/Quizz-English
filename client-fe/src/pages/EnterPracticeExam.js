import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Radio, Typography, Modal, Progress, Card, Space, Alert } from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined, CheckCircleOutlined, StopOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

const EnterPracticeExam = () => {
  const [examCode, setExamCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [topic, setTopic] = useState('');
  const [examStatus, setExamStatus] = useState('NOT_STARTED'); // NOT_STARTED, IN_PROGRESS, SUBMITTED
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [examDuration, setExamDuration] = useState(30); // 30 phút mặc định
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 🟦 Timer effect
  useEffect(() => {
    let timer;
    if (examStatus === 'IN_PROGRESS' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Tự động nộp bài khi hết thời gian
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStatus, timeLeft]);

  // 🟦 Ngăn chặn reload/back khi đang làm bài
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStatus === 'IN_PROGRESS' && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Bạn đang trong quá trình làm bài thi. Nếu thoát, bài thi sẽ bị hủy. Bạn có chắc chắn muốn thoát?';
        return e.returnValue;
      }
    };

    const handlePopState = (e) => {
      if (examStatus === 'IN_PROGRESS') {
        e.preventDefault();
        showExitConfirmation();
        // Push state trở lại để ngăn navigation
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    if (examStatus === 'IN_PROGRESS') {
      // Thêm state vào history để detect back button
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [examStatus, hasUnsavedChanges]);

  // 🟦 Hiển thị xác nhận thoát
  const showExitConfirmation = useCallback(() => {
    confirm({
      title: 'Xác nhận thoát khỏi bài thi',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Bạn đang trong quá trình làm bài thi.</p>
          <p><strong>Cảnh báo:</strong> Nếu thoát bây giờ, bài thi sẽ bị hủy và bạn không thể làm lại.</p>
          <p>Bạn có chắc chắn muốn thoát?</p>
        </div>
      ),
      okText: 'Thoát',
      okType: 'danger',
      cancelText: 'Tiếp tục làm bài',
      onOk: () => {
        handleCancelExam();
      },
    });
  }, []);

  // 🟦 Hủy bài thi
  const handleCancelExam = async () => {
    try {
      // Gọi API hủy bài thi
      await fetch('http://localhost:9999/api/practice-questions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ examCode })
      });

      // Reset state
      setExamStatus('NOT_STARTED');
      setQuestions([]);
      setAnswers({});
      setResult(null);
      setTimeLeft(null);
      setHasUnsavedChanges(false);
      
      Modal.info({
        title: 'Bài thi đã bị hủy',
        icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
        content: (
          <div>
            <p>Bạn đã thoát khỏi bài thi thành công.</p>
            <p><strong>Lưu ý:</strong> Bài thi này không thể làm lại.</p>
          </div>
        ),
        okText: 'Về trang chủ',
        onOk: () => {
          window.location.href = '/';
        }
      });
    } catch (err) {
      console.error('Error canceling exam:', err);
      Modal.error({
        title: 'Lỗi khi hủy bài thi',
        icon: <ExclamationCircleOutlined />,
        content: 'Có lỗi xảy ra khi hủy bài thi. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
        okText: 'Đóng'
      });
    }
  };

  // 🟦 Lấy danh sách câu hỏi theo examCode
  const fetchQuestions = async () => {
    if (!examCode.trim()) {
      Modal.warning({
        title: 'Thiếu thông tin',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        content: (
          <div>
            <p>Vui lòng nhập mã đề thi để tiếp tục.</p>
            <p>Mã đề thi không được để trống.</p>
          </div>
        ),
        okText: 'Đã hiểu'
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:9999/api/practice-questions/access?examCode=${examCode}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch questions');
      }

      const data = await res.json();
      
      // 🔥 Kiểm tra nếu đã làm bài này rồi - sử dụng Modal.error
      if (data.alreadySubmitted) {
        Modal.error({
          title: 'Không thể làm bài thi',
          icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
          content: (
            <div>
              <p><strong>Bạn đã hoàn thành bài thi này</strong></p>
              <p>Mỗi bài thi chỉ được phép làm một lần duy nhất.</p>
              <p>Vui lòng chọn bài thi khác hoặc liên hệ giáo viên để được hỗ trợ.</p>
            </div>
          ),
          okText: 'Đã hiểu',
          onOk: () => {
            setExamCode(''); // Reset exam code
          }
        });
        return;
      }

      const questions = data.questions || data;
      const examDuration = data.duration || 10; // Lấy duration từ response
      const examTopic = data.topic || questions[0]?.topic || 'Không xác định';
      
      setQuestions(questions);
      setTopic(examTopic);
      setExamDuration(examDuration);
      setTimeLeft(examDuration * 60); // Convert to seconds
      
      // 🔥 Hiển thị modal xác nhận bắt đầu với thông tin chi tiết
      confirm({
        title: 'Xác nhận bắt đầu bài thi',
        icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
        width: 500,
        content: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>📋 Thông tin bài thi:</strong></p>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>Chủ đề:</strong> {examTopic}</li>
                <li><strong>Số câu hỏi:</strong> {questions.length} câu</li>
                <li><strong>Thời gian:</strong> {examDuration} phút</li>
                <li><strong>Mã đề:</strong> {examCode}</li>
              </ul>
            </div>
            <Alert 
              message="⚠️ Lưu ý quan trọng" 
              description={
                <div>
                  <p>• Sau khi bắt đầu, bạn không thể thoát và làm lại bài thi này</p>
                  <p>• Hệ thống sẽ tự động nộp bài khi hết thời gian</p>
                  <p>• Hãy đảm bảo kết nối internet ổn định</p>
                </div>
              }
              type="warning" 
              style={{ marginTop: 16 }}
            />
          </div>
        ),
        okText: '🚀 Bắt đầu làm bài',
        cancelText: 'Hủy',
        onOk: () => {
          startExam();
        },
      });

    } catch (err) {
      console.error(err);
      Modal.error({
        title: 'Lỗi khi tải đề thi',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p><strong>Không thể tải đề thi</strong></p>
            <p>Lý do: {err.message}</p>
            <p>Vui lòng:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Kiểm tra mã đề thi có chính xác không</li>
              <li>Đảm bảo kết nối internet ổn định</li>
              <li>Thử lại sau vài giây</li>
            </ul>
          </div>
        ),
        okText: 'Đóng'
      });
    }
  };

  // 🟦 Bắt đầu làm bài
  const startExam = () => {
    setExamStatus('IN_PROGRESS');
    setAnswers({});
    setResult(null);
    setHasUnsavedChanges(false);
    
    // Thông báo bắt đầu thành công
    Modal.success({
      title: 'Bài thi đã bắt đầu',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <p>🎯 Bạn đã bắt đầu làm bài thi thành công!</p>
          <p>Chúc bạn làm bài tốt!</p>
        </div>
      ),
      okText: 'Bắt đầu',
      mask: false, // Cho phép click outside để đóng
      autoFocusButton: null
    });
  };

  // 🟦 Xử lý chọn đáp án
  const handleSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    setHasUnsavedChanges(true);
  };

  // 🟦 Tự động nộp bài khi hết thời gian
  const handleAutoSubmit = async () => {
    Modal.warning({
      title: '⏰ Hết thời gian làm bài',
      icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      content: (
        <div>
          <p><strong>Thời gian làm bài đã kết thúc!</strong></p>
          <p>Hệ thống sẽ tự động nộp bài của bạn.</p>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      ),
      okText: 'Đồng ý',
      onOk: () => {
        submitExam(true);
      }
    });
  };

  // 🟦 Nộp bài
  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q._id]);
    
    if (unanswered.length > 0) {
      confirm({
        title: '❓ Còn câu hỏi chưa trả lời',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        width: 500,
        content: (
          <div>
            <p><strong>Bạn còn {unanswered.length} câu chưa trả lời:</strong></p>
            <div style={{ 
              maxHeight: 150, 
              overflow: 'auto', 
              border: '1px solid #d9d9d9', 
              padding: 8, 
              borderRadius: 4,
              backgroundColor: '#fafafa',
              margin: '8px 0'
            }}>
              {unanswered.map((q, i) => (
                <div key={i}>• Câu {questions.indexOf(q) + 1}: {q.question.substring(0, 50)}...</div>
              ))}
            </div>
            <p>Các câu chưa trả lời sẽ được tính là sai.</p>
            <p><strong>Bạn có muốn nộp bài ngay bây giờ?</strong></p>
          </div>
        ),
        okText: '📝 Nộp bài ngay',
        cancelText: 'Tiếp tục làm',
        onOk: () => submitExam(),
      });
    } else {
      confirm({
        title: '✅ Xác nhận nộp bài',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        content: (
          <div>
            <p><strong>Bạn đã hoàn thành tất cả {questions.length} câu hỏi!</strong></p>
            <p>Sau khi nộp bài, bạn sẽ không thể sửa đổi đáp án.</p>
            <p>Bạn có chắc chắn muốn nộp bài không?</p>
          </div>
        ),
        okText: '🎯 Nộp bài',
        cancelText: 'Kiểm tra lại',
        onOk: () => submitExam(),
      });
    }
  };

  // 🟦 Submit exam logic
  const submitExam = async (isAutoSubmit = false) => {
    setIsSubmitting(true);
    
    try {
      const formattedAnswers = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || '' // Empty string for unanswered
      }));

      const res = await fetch('http://localhost:9999/api/practice-questions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          examCode,
          answers: formattedAnswers,
          isAutoSubmit
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit exam');
      }

      const data = await res.json();
      setResult(data);
      setExamStatus('SUBMITTED');
      setHasUnsavedChanges(false);
      
      // 🔥 Modal thành công với thông tin chi tiết
      Modal.success({
        title: '🎉 Nộp bài thành công!',
        icon: <CheckCircleOutlined />,
        width: 500,
        content: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              <p><strong>📊 Kết quả bài thi của bạn:</strong></p>
            </div>
            <div style={{ 
              padding: 16, 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: 8,
              margin: '16px 0'
            }}>
              <p style={{ fontSize: 24, margin: 0, color: '#52c41a' }}>
                <strong>🏆 {data.score}/10 điểm</strong>
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                ({data.correct}/{data.total} câu đúng - {((data.correct/data.total)*100).toFixed(1)}%)
              </p>
            </div>
            <p>Chúc mừng bạn đã hoàn thành bài thi!</p>
          </div>
        ),
        okText: 'Xem kết quả chi tiết'
      });

    } catch (err) {
      console.error(err);
      Modal.error({
        title: '❌ Lỗi khi nộp bài',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p><strong>Có lỗi xảy ra khi nộp bài thi</strong></p>
            <p>Lý do: {err.message}</p>
            <p>Vui lòng:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Kiểm tra kết nối internet</li>
              <li>Thử nộp bài lại</li>
              <li>Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục</li>
            </ul>
          </div>
        ),
        okText: 'Thử lại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟦 Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🟦 Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>🎓 Hệ thống thi trực tuyến</Title>

      {examStatus === 'NOT_STARTED' && (
        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>🔑 Nhập mã đề thi</Title>
            <Text type="secondary">
              Vui lòng nhập mã đề thi để bắt đầu làm bài
            </Text>
            <Input
              placeholder="Nhập mã examCode (ví dụ: EXAM2024001)"
              value={examCode}
              onChange={e => setExamCode(e.target.value)}
              style={{ width: 400 }}
              onPressEnter={fetchQuestions}
              size="large"
            />
            <Button 
              type="primary" 
              size="large" 
              onClick={fetchQuestions}
              style={{ minWidth: 200 }}
            >
              🚀 Lấy đề thi
            </Button>
          </Space>
        </Card>
      )}

      {examStatus === 'IN_PROGRESS' && (
        <div>
          {/* Header with timer and progress */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  📝 {topic}
                </Title>
                <Text type="secondary">
                  Đã trả lời: {answeredCount}/{questions.length} câu
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined />
                  <Text strong style={{ fontSize: 18, color: timeLeft < 300 ? '#ff4d4f' : '#1890ff' }}>
                    {formatTime(timeLeft)}
                  </Text>
                </div>
                <Progress 
                  percent={progressPercent} 
                  size="small" 
                  style={{ width: 200, marginTop: 8 }}
                  strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
                />
              </div>
            </div>
          </Card>

          {/* Questions */}
          {questions.map((q, index) => (
            <Card key={q._id} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  Câu {index + 1}: {q.question}
                  {answers[q._id] && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
                </Text>
              </div>
              <Radio.Group
                onChange={e => handleSelect(q._id, e.target.value)}
                value={answers[q._id]}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {q.options.map((opt, i) => (
                    <Radio key={i} value={opt}>
                      {opt}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Card>
          ))}

          {/* Submit button */}
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                size="large" 
                onClick={handleSubmit}
                loading={isSubmitting}
                style={{ minWidth: 200 }}
              >
                📤 Nộp bài thi
              </Button>
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  Đã trả lời {answeredCount}/{questions.length} câu hỏi
                  {answeredCount === questions.length && 
                    <span style={{ color: '#52c41a', marginLeft: 8 }}>✅ Hoàn thành</span>
                  }
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {examStatus === 'SUBMITTED' && result && (
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>
              🎉 Hoàn thành bài thi
            </Title>
            
            <div style={{ fontSize: 18, marginBottom: 24 }}>
              <p><strong>📋 Chủ đề:</strong> {topic}</p>
              <p><strong>✅ Số câu đúng:</strong> {result.correct}/{result.total}</p>
              <p><strong>🏆 Điểm số:</strong> 
                <span style={{ 
                  fontSize: 32, 
                  color: result.score >= 5 ? '#52c41a' : '#ff4d4f',
                  marginLeft: 8 
                }}>
                  {result.score}/10
                </span>
              </p>
            </div>

            <Alert
              message="✅ Bài thi đã hoàn thành"
              description="Cảm ơn bạn đã tham gia. Kết quả đã được lưu vào hệ thống."
              type="success"
              style={{ marginBottom: 16 }}
            />

            <Space>
              <Button type="primary" onClick={() => window.location.href = '/'}>
                🏠 Về trang chủ
              </Button>
              <Button onClick={() => {
                setExamStatus('NOT_STARTED');
                setExamCode('');
                setQuestions([]);
                setAnswers({});
                setResult(null);
                setTimeLeft(null);
                setHasUnsavedChanges(false);
              }}>
                📝 Làm bài khác
              </Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnterPracticeExam;