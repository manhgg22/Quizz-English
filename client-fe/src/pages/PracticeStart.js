import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Typography, Radio, Button,
  message, Space, Modal, Alert
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { getExplanations } from '../api/api'; // ✅ import API gọi backend để lấy giải thích Gemini

const { Title, Text } = Typography;

const PracticeStart = () => {
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [explanations, setExplanations] = useState([]); // ✅ chứa giải thích từ Gemini
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  // ✅ Chặn navigation thủ công thay thế useBlocker
  const handlePopState = useCallback((e) => {
    if (!submitted) {
      e.preventDefault();
      Modal.confirm({
        title: '⚠️ Cảnh báo',
        content: 'Bạn đang làm bài thi. Nếu thoát, dữ liệu sẽ bị mất. Bạn có chắc muốn thoát?',
        okText: 'Thoát',
        cancelText: 'Ở lại',
        okType: 'danger',
        onOk: () => {
          // Cho phép thoát
          navigate('/practice');
        },
        onCancel: () => {
          // Đẩy lại state để người dùng ở lại trang
          window.history.pushState(null, '', window.location.pathname);
        }
      });
      // Đẩy lại state để ngăn navigation
      window.history.pushState(null, '', window.location.pathname);
    }
  }, [submitted, navigate]);

  // ✅ Chặn reload/tab close  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitted]);

  // Vô hiệu hóa F5, Ctrl+R, Ctrl+F5
  const handleKeyDown = useCallback((e) => {
    if (!submitted) {
      // F5
      if (e.key === 'F5') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }
      
      // Ctrl + R (Reload)
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }
      
      // Ctrl + F5 (Hard reload)
      if (e.ctrlKey && e.key === 'F5') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }
      
      // Ctrl + Shift + R (Hard reload)
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }

      // Chặn mở Developer Tools
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        message.warning('Không thể mở Developer Tools khi đang làm bài!');
        return;
      }
    }
  }, [submitted]);

  // Chặn right-click menu
  const handleContextMenu = useCallback((e) => {
    if (!submitted) {
      e.preventDefault();
      message.warning('Không thể click chuột phải khi đang làm bài!');
    }
  }, [submitted]);

  // Chặn việc rời focus khỏi window (Alt+Tab, etc.)
  const handleVisibilityChange = useCallback(() => {
    if (!submitted && document.hidden) {
      message.warning('⚠️ Phát hiện bạn đã chuyển sang tab/ứng dụng khác!');
      // Có thể thêm logic đếm số lần vi phạm ở đây
    }
  }, [submitted]);

  useEffect(() => {
    const data = localStorage.getItem('quickPracticeQuestions');
    if (!data) {
      message.error('Không tìm thấy dữ liệu luyện tập');
      navigate('/practice');
      return;
    }

    const parsed = JSON.parse(data);
    setQuestions(parsed.questions || []);
    setTopic(parsed.topic || '');
    setTimeLeft((parsed.duration || 10) * 60);
  }, [navigate]);



  

  // ✅ Setup các event listeners bảo mật
  useEffect(() => {
    // Chặn browser back/forward
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);
    
    // Chặn keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
    
    // Chặn right-click
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Theo dõi focus
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handlePopState, handleKeyDown, handleContextMenu, handleVisibilityChange]);

  useEffect(() => {
    if (submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      message.info('⏰ Hết thời gian, tự động nộp bài!');
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (submitted) return;

    if (Object.keys(answers).length !== questions.length) {
      Modal.confirm({
        title: 'Một số câu chưa trả lời',
        content: 'Bạn vẫn muốn nộp bài chứ?',
        okText: 'Nộp bài',
        cancelText: 'Quay lại',
        onOk: submitAnswers
      });
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setSubmitted(true);

    try {
      const response = await fetch('http://localhost:9999/api/practice-questions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
          examCode: 'quick-practice',
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return message.error(result.message || 'Lỗi khi nộp bài');
      }

      const correctMap = {};
      result.correctAnswers?.forEach((item) => {
        correctMap[item.questionId] = item.correctAnswer;
      });
      setCorrectAnswers(correctMap);

      // ✅ LỌC CÂU SAI VÀ GỬI ĐI LẤY GIẢI THÍCH
      const wrongAnswers = questions
        .filter(q => answers[q._id] !== correctMap[q._id])
        .map(q => ({
          question: q.question,
          selected: answers[q._id],
          correct: correctMap[q._id]
        }));

      if (wrongAnswers.length > 0) {
        try {
          const explainRes = await getExplanations(wrongAnswers);
          setExplanations(explainRes.explanations || []);
        } catch (error) {
          console.error('Lỗi khi lấy giải thích từ Gemini:', error);
          message.warning('Không thể tải giải thích từ AI');
        }
      }

      // ✅ Hiển thị trong Modal kết quả + đáp án chi tiết
      Modal.success({
        title: '🎉 Kết quả luyện tập',
        width: 800,
        content: (
          <div>
            <p>Chủ đề: <strong>{topic}</strong></p>
            <p>Số câu đúng: <strong>{result.correct}/{result.total}</strong></p>
            <p>Điểm: <strong>{result.score.toFixed(2)}/10</strong></p>

            <div style={{ marginTop: 20, maxHeight: '400px', overflowY: 'auto' }}>
              {questions.map((q, index) => {
                const correct = correctMap[q._id];
                const selected = answers[q._id];
                return (
                  <Card key={q._id} size="small" title={`Câu ${index + 1}`} style={{ marginBottom: 10 }}>
                    <p><Text strong>{q.question}</Text></p>
                    {q.options.map((opt, i) => (
                      <div key={i}>
                        {opt === correct && (
                          <Text type="success">✅ {String.fromCharCode(65 + i)}. {opt} (Đáp án đúng)</Text>
                        )}
                        {opt === selected && opt !== correct && (
                          <Text type="danger">❌ {String.fromCharCode(65 + i)}. {opt} (Bạn chọn)</Text>
                        )}
                        {opt !== correct && opt !== selected && (
                          <Text>{String.fromCharCode(65 + i)}. {opt}</Text>
                        )}
                      </div>
                    ))}
                  </Card>
                );
              })}

              {/* ✅ HIỂN THỊ GIẢI THÍCH TỪ GEMINI */}
              {explanations.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Title level={4}>🧠 Giải thích câu sai từ trợ lý AI</Title>
                  {explanations.map((item, idx) => (
                    <Card key={idx} type="inner" title={`Giải thích câu ${idx + 1}`} style={{ marginBottom: 10 }}>
                      <p><Text strong>{item.question}</Text></p>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{item.explanation}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ),
        okText: 'Làm lại',
        onOk: () => {
          localStorage.removeItem('quickPracticeQuestions');
          navigate('/practice');
        }
      });

    } catch (err) {
      console.error(err);
      message.error('Không thể nộp bài');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Thông báo cảnh báo ở đầu trang */}
      <Alert
        message="⚠️ Lưu ý quan trọng"
        description="Trong quá trình làm bài, vui lòng không thoát trang, reload, hoặc chuyển sang tab khác. Hệ thống sẽ theo dõi các hành vi này."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={3}>Chủ đề: {topic}</Title>
        <Alert
          message={`⏱ Thời gian còn lại: ${formatTime(timeLeft)}`}
          type={timeLeft < 60 ? 'warning' : 'info'}
          showIcon
        />
      </div>

      {questions.map((q, index) => (
        <Card key={q._id} title={`Câu ${index + 1}`} className="mb-4">
          <p><Text strong>{q.question}</Text></p>
          <Radio.Group
            disabled={submitted}
            onChange={e => handleSelect(q._id, e.target.value)}
            value={answers[q._id]}
          >
            <Space direction="vertical" style={{ marginTop: 10 }}>
              {q.options.map((opt, i) => {
                const isCorrect = correctAnswers[q._id] === opt;
                const isSelected = answers[q._id] === opt;

                return (
                  <Radio key={i} value={opt}>
                    {String.fromCharCode(65 + i)}. {opt}
                    {submitted && isCorrect && (
                      <Text type="success"> (Đáp án đúng)</Text>
                    )}
                    {submitted && isSelected && !isCorrect && (
                      <Text type="danger"> (Bạn chọn)</Text>
                    )}
                  </Radio>
                );
              })}
            </Space>
          </Radio.Group>
        </Card>
      ))}

      {!submitted && questions.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
          >
            Nộp bài
          </Button>
        </div>
      )}
    </div>
  );
};

export default PracticeStart;