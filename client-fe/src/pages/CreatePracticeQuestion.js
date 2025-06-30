import React, { useEffect, useState } from 'react';
import { Card, Select, Button, Typography, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const QuickPractice = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('http://localhost:9999/api/practice-questions/topics', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
          }
        });
        const data = await response.json();
        setTopics(data.topics || []);
      } catch (err) {
        console.error(err);
        message.error('Không thể tải danh sách chủ đề.');
      }
    };

    fetchTopics();
  }, []);

  const handleStartPractice = async () => {
    if (!selectedTopic || !questionCount) {
      return message.warning('Vui lòng chọn chủ đề và số câu hỏi');
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:9999/api/practice-questions/by-topic?topic=${encodeURIComponent(selectedTopic)}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
      });

      const data = await response.json();
      const allQuestions = data.questions || [];

      if (allQuestions.length === 0) {
        return message.error('Không có câu hỏi nào cho chủ đề này.');
      }

      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, questionCount);

      if (selectedQuestions.length < questionCount) {
        message.info(`Chỉ có ${selectedQuestions.length} câu hỏi cho chủ đề này.`);
      }

      localStorage.setItem('quickPracticeQuestions', JSON.stringify({
  topic: selectedTopic,
  duration: data.duration || 10, // 👈 lấy từ response backend
  questions: selectedQuestions,
}));


      navigate('/practice/start');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi lấy câu hỏi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={<Title level={3}>Luyện Tập Nhanh Theo Chủ Đề</Title>}
      bordered
      style={{ maxWidth: 700, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      {loading ? <Spin /> : (
        <>
          <Text strong>Chọn chủ đề:</Text>
          <Select
            value={selectedTopic}
            onChange={setSelectedTopic}
            style={{ width: '100%', marginBottom: 20 }}
            placeholder="Chọn chủ đề"
          >
            {topics.map(topic => (
              <Option key={topic} value={topic}>{topic}</Option>
            ))}
          </Select>

          <Text strong>Chọn số câu hỏi:</Text>
          <Select
            value={questionCount}
            onChange={setQuestionCount}
            style={{ width: '100%', marginBottom: 20 }}
          >
            {[1, 5, 10, 20, 30, 50].map(count => (
              <Option key={count} value={count}>{count} câu</Option>
            ))}
          </Select>


          <Button
            type="primary"
            size="large"
            onClick={handleStartPractice}
            disabled={!selectedTopic || !questionCount}
            style={{ width: '100%' }}
          >
            Bắt đầu luyện tập
          </Button>
        </>
      )}
    </Card>
  );
};

export default QuickPractice;
