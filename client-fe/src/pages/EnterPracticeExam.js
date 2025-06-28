import React, { useState } from 'react';
import { Input, Button, message, Radio, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const EnterPracticeExam = () => {
  const [examCode, setExamCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [topic, setTopic] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // 🟦 Lấy danh sách câu hỏi theo examCode
  const fetchQuestions = async () => {
    if (!examCode.trim()) {
      return message.warning('Vui lòng nhập mã examCode');
    }

    try {
      const res = await axios.get(`http://localhost:9999/api/practice-questions/access`, {
        params: { examCode },
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      setQuestions(res.data);
      setTopic(res.data[0]?.topic || '');
      setSubmitted(false);
      setResult(null);
      setAnswers({});
      message.success('Lấy đề thi thành công!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể lấy đề thi';
      message.error(msg);
    }
  };

  // 🟦 Xử lý chọn đáp án
  const handleSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  // 🟦 Nộp bài
  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q._id]);
    if (unanswered.length > 0) {
      const missingList = unanswered.map((q, i) => `Câu ${i + 1}`).join(', ');
      return message.warning(`Bạn chưa trả lời đầy đủ: ${missingList}`);
    }

    try {
      const formattedAnswers = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id]
      }));

      const res = await axios.post('http://localhost:9999/api/practice-questions/submit', {
        examCode,
        answers: formattedAnswers
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      setResult(res.data);
      setSubmitted(true);
      message.success('🎉 Nộp bài thành công!');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi nộp bài');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>Làm bài ôn tập</Title>

      <Input
        placeholder="Nhập mã examCode"
        value={examCode}
        onChange={e => setExamCode(e.target.value)}
        style={{ width: 300, marginBottom: 16 }}
      />
      <Button type="primary" onClick={fetchQuestions}>Bắt đầu</Button>

      {questions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4}>Chủ đề: {topic}</Title>

          {questions.map((q, index) => (
            <div key={q._id} style={{ marginBottom: 20 }}>
              <strong>Câu {index + 1}:</strong> {q.question}
              <Radio.Group
                onChange={e => handleSelect(q._id, e.target.value)}
                value={answers[q._id]}
                style={{ display: 'block', marginTop: 8 }}
              >
                {q.options.map((opt, i) => (
                  <Radio key={i} value={opt} style={{ display: 'block' }}>
                    {opt}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          ))}

          {!submitted && (
            <Button type="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
              Nộp bài
            </Button>
          )}

          {result && (
            <div style={{ marginTop: 24 }}>
              <Title level={4}>🎯 Kết quả</Title>
              <p>✅ Số câu đúng: {result.correct}/{result.total}</p>
              <p>📝 Điểm: {result.score}/10</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnterPracticeExam;
