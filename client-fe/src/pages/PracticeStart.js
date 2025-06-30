import React, { useEffect, useState } from 'react';
import {
  Card, Typography, Radio, Button,
  message, Space, Modal, Alert
} from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PracticeStart = () => {
  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

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
    setTimeLeft((parsed.duration || 10) * 60); // phút → giây
  }, [navigate]);

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
