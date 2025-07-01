import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Typography, Radio, Button,
  message, Space, Modal, Alert, FloatButton, Input, Spin, Badge, Tabs, Drawer
} from 'antd';
import { SendOutlined, RobotFilled, CommentOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getExplanations } from '../api/api';
import AIReviewBox from '../pages/AIReviewBox';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const PracticeStart = () => {
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [explanations, setExplanations] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  
  // AI Chatbot states - Optimized
  const [chatVisible, setChatVisible] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [newMessages, setNewMessages] = useState(0);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const navigate = useNavigate();

  // Chặn navigation thủ công thay thế useBlocker
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
          navigate('/practice');
        },
        onCancel: () => {
          window.history.pushState(null, '', window.location.pathname);
        }
      });
      window.history.pushState(null, '', window.location.pathname);
    }
  }, [submitted, navigate]);

  // Chặn reload/tab close  
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
      if (e.key === 'F5') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }

      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }

      if (e.ctrlKey && e.key === 'F5') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        message.warning('Không thể refresh trang khi đang làm bài!');
        return;
      }

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

  const handleContextMenu = useCallback((e) => {
    if (!submitted) {
      e.preventDefault();
      message.warning('Không thể click chuột phải khi đang làm bài!');
    }
  }, [submitted]);

  const handleVisibilityChange = useCallback(() => {
    if (!submitted && document.hidden) {
      message.warning('⚠️ Phát hiện bạn đã chuyển sang tab/ứng dụng khác!');
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

  // Setup các event listeners bảo mật
  useEffect(() => {
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

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
      onOk: () => {
        setLoadingSubmit(true);
        submitAnswers();
      }
    });
  } else {
    setLoadingSubmit(true);
    submitAnswers();
  }
};


  // AI Chatbot functions - Optimized
  const initializeChat = (correctCount, total, score) => {
    const wrongCount = total - correctCount;
    const initialMessage = `🎉 Chúc mừng bạn đã hoàn thành bài luyện tập!

📊 **Kết quả:**
• Chủ đề: ${topic}
• Số câu đúng: ${correctCount}/${total}
• Điểm: ${score.toFixed(2)}/10

${wrongCount > 0 ? `❌ Bạn có ${wrongCount} câu sai. Tôi sẽ giúp bạn giải thích!` : '✅ Tuyệt vời! Bạn làm đúng tất cả!'}

💬 Hãy hỏi tôi về bất kỳ câu nào bạn muốn hiểu rõ hơn nhé!`;

    setChat([{ from: 'bot', text: initialMessage }]);
  };

  const handleChatSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { from: 'user', text: input };
    const newChat = [...chat, userMessage];
    setChat(newChat);
    setInput('');
    setLoading(true);

    try {
      // Chuẩn bị context cho AI
      const wrongQuestions = questions
        .filter(q => answers[q._id] !== correctAnswers[q._id])
        .map((q, index) => ({
          questionNumber: index + 1,
          question: q.question,
          options: q.options,
          selected: answers[q._id] || 'Không trả lời',
          correct: correctAnswers[q._id]
        }));

      const contextPrompt = `
        Bài thi về chủ đề: ${topic}
        Kết quả: ${testResult?.correct}/${testResult?.total} (${testResult?.score.toFixed(2)}/10)
        
        ${wrongQuestions.length > 0 ? `Các câu sai:
        ${wrongQuestions.map((q) => `
        Câu ${q.questionNumber}: ${q.question}
        - Các lựa chọn: ${q.options.join(', ')}
        - Học sinh chọn: ${q.selected}
        - Đáp án đúng: ${q.correct}
        `).join('\n')}` : 'Học sinh làm đúng tất cả các câu.'}
        
        Câu hỏi của học sinh: ${input}
        
        Hãy trả lời như một giáo viên thân thiện, giải thích rõ ràng và dễ hiểu. Nếu học sinh hỏi về câu cụ thể, hãy giải thích tại sao đáp án đúng là đúng và tại sao đáp án sai là sai.
      `;

      const res = await fetch('http://localhost:9999/api/explain/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ prompt: contextPrompt })
      });

      const data = await res.json();
      const botMessage = { 
        from: 'bot', 
        text: data.reply || '⚠️ Xin lỗi, tôi không thể trả lời lúc này.' 
      };
      
      setChat([...newChat, botMessage]);
      
      // Chỉ tăng newMessages nếu chat đang đóng
      if (!chatVisible) {
        setNewMessages(prev => prev + 1);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChat([...newChat, { 
        from: 'bot', 
        text: '❌ Lỗi kết nối. Vui lòng thử lại sau.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setChatVisible(!chatVisible);
    if (!chatVisible) {
      setNewMessages(0); // Reset thông báo khi mở chat
    }
  };

  // Render Chat Component - Optimized để có thể tái sử dụng
  const renderChatbox = () => (
    <div
      style={{
        position: 'fixed',
        right: 24,
        bottom: 90,
        width: 380,
        height: 500,
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Chat Header */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RobotFilled style={{ fontSize: '18px' }} />
          <Text strong style={{ color: 'white', fontSize: '16px' }}>Trợ lý AI</Text>
        </div>
        <Button 
          type="text" 
          size="small" 
          icon={<CloseOutlined />}
          onClick={toggleChat}
          style={{ color: 'white' }}
        />
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        background: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.from === 'bot' ? 'flex-start' : 'flex-end'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.from === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                background: msg.from === 'bot' ? '#fff' : '#1890ff',
                color: msg.from === 'bot' ? '#000' : '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.5',
                border: msg.from === 'bot' ? '1px solid #f0f0f0' : 'none'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '12px 16px',
              background: '#fff',
              borderRadius: '16px 16px 16px 4px',
              border: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Spin size="small" />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Đang suy nghĩ...
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey && !loading) {
                e.preventDefault();
                handleChatSend();
              }
            }}
            placeholder="Hỏi về câu hỏi cụ thể, giải thích thêm..."
            style={{ 
              resize: 'none',
              fontSize: '14px'
            }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleChatSend}
            loading={loading}
            disabled={!input.trim()}
            style={{ height: '66px' }}
          />
        </Space.Compact>
        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
          Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </Text>
      </div>
    </div>
  );

 const submitAnswers = async () => {
  setLoadingSubmit(true); // đảm bảo trạng thái loading

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
      message.error(result.message || 'Lỗi khi nộp bài');
      return;
    }

    const correctMap = {};
    result.correctAnswers?.forEach((item) => {
      correctMap[item.questionId] = item.correctAnswer;
    });

    setCorrectAnswers(correctMap);
    setTestResult(result);
    initializeChat(result.correct, result.total, result.score);

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

    // ✅ Cuối cùng mới set submitted
    setSubmitted(true);
    setResultModalVisible(true);
  } catch (err) {
    console.error(err);
    message.error('Không thể nộp bài');
  } finally {
    setLoadingSubmit(false);
  }
};



  // Render Result Modal với Tabs
  const renderResultModal = () => (
    <Modal
      title="🎉 Kết quả luyện tập"
      open={resultModalVisible}
      onCancel={() => setResultModalVisible(false)}
      width={900}
      footer={[
        <Button key="chat" type="primary" icon={<CommentOutlined />} onClick={() => {
          setResultModalVisible(false);
          setChatVisible(true);
        }}>
          Hỏi AI
        </Button>,
        <Button key="retry" onClick={() => {
          localStorage.removeItem('quickPracticeQuestions');
          navigate('/practice');
        }}>
          Làm lại
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>Chủ đề: <Text strong>{topic}</Text></Text><br/>
        <Text>Số câu đúng: <Text strong>{testResult?.correct}/{testResult?.total}</Text></Text><br/>
        <Text>Điểm: <Text strong>{testResult?.score.toFixed(2)}/10</Text></Text>
      </div>

      <Tabs defaultActiveKey="1" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <TabPane tab="📝 Chi tiết câu hỏi" key="1">
          {questions.map((q, index) => {
            const correct = correctAnswers[q._id];
            const selected = answers[q._id];
            const isCorrect = selected === correct;
            
            return (
              <Card 
                key={q._id} 
                size="small" 
                title={`Câu ${index + 1}`} 
                style={{ 
                  marginBottom: 16,
                  border: isCorrect ? '1px solid #52c41a' : '1px solid #ff4d4f'
                }}
              >
                <p><Text strong>{q.question}</Text></p>
                <div style={{ marginTop: 8 }}>
                  {q.options.map((opt, i) => {
                    const isThisCorrect = opt === correct;
                    const isThisSelected = opt === selected;
                    
                    return (
                      <div key={i} style={{ margin: '4px 0' }}>
                        {isThisCorrect && (
                          <Text type="success" style={{ display: 'block' }}>
                            ✅ {String.fromCharCode(65 + i)}. {opt} (Đáp án đúng)
                          </Text>
                        )}
                        {isThisSelected && !isThisCorrect && (
                          <Text type="danger" style={{ display: 'block' }}>
                            ❌ {String.fromCharCode(65 + i)}. {opt} (Bạn chọn)
                          </Text>
                        )}
                        {!isThisCorrect && !isThisSelected && (
                          <Text style={{ display: 'block', color: '#999' }}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </TabPane>

        {explanations.length > 0 && (
          <TabPane tab="🧠 Giải thích AI" key="2">
            <div>
              <Title level={4}>Giải thích các câu sai từ trợ lý AI</Title>
              {explanations.map((item, idx) => (
                <AIReviewBox key={idx} explanation={item.explanation} index={idx} />
              ))}
            </div>
          </TabPane>
        )}
      </Tabs>

      <Alert 
        message="💡 Mẹo" 
        description="Nhấn 'Hỏi AI' để chat trực tiếp với trợ lý về các câu hỏi bạn muốn hiểu rõ thêm!" 
        type="info" 
        showIcon 
        style={{ marginTop: 16 }}
      />
    </Modal>
  );

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
    <Spin spinning={loadingSubmit}>
      <Button
        type="primary"
        size="large"
        onClick={handleSubmit}
        disabled={loadingSubmit}
      >
        Nộp bài
      </Button>
    </Spin>
  </div>
)}


      {/* AI Chatbot FloatButton - chỉ hiển thị sau khi nộp bài */}
      {/* Luôn luôn hiển thị modal kết quả nếu cần */}
{resultModalVisible && renderResultModal()}

{/* Hiển thị FloatButton và chatbox nếu đã nộp bài */}
{submitted && (
  <>
    <Badge count={newMessages} offset={[-8, 8]}>
      <FloatButton
        icon={<RobotFilled />}
        onClick={toggleChat}
        type={chatVisible ? "default" : "primary"}
        tooltip="Hỏi trợ lý AI"
        style={{ right: 24, bottom: 24 }}
      />
    </Badge>

    {chatVisible && renderChatbox()}
  </>
)}

    </div>
  );
};

export default PracticeStart;