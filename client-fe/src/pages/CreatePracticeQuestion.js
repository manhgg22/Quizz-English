import React, { useState } from 'react';
import { Input, Button, message, Select, Typography, Divider, List, Space } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const CreatePracticeQuestion = () => {
  const [topic, setTopic] = useState('');
  const [examCode, setExamCode] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionList, setQuestionList] = useState([]);

  // ✅ Tạo mã đề ngẫu nhiên một lần duy nhất
  const generateExamCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  const handleAddToList = () => {
    if (!question || !correctAnswer || options.some(o => !o)) {
      return message.warning('Vui lòng nhập đầy đủ nội dung câu hỏi');
    }

    const newItem = { question, options, correctAnswer };
    setQuestionList(prev => [...prev, newItem]);
    resetForm();
  };

  const handleSubmitAll = async () => {
    if (!topic || questionList.length === 0) {
      return message.warning('Chưa có chủ đề hoặc chưa thêm câu hỏi nào');
    }

    const finalExamCode = examCode || generateExamCode();
    setExamCode(finalExamCode); // Lưu lại mã nếu chưa có

    try {
      const res = await axios.post('http://localhost:9999/api/practice-questions', {
        topic,
        examCode: finalExamCode,
        questions: questionList
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });

      message.success(`Đã tạo thành công ${questionList.length} câu hỏi!`);
      // Reset mọi thứ sau khi gửi
      setTopic('');
      setExamCode('');
      setQuestionList([]);
      resetForm();
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi gửi danh sách câu hỏi');
    }
  };

  return (
    <div style={{ maxWidth: 750, margin: '0 auto' }}>
      <Title level={3}>Tạo bài ôn tập nhiều câu hỏi</Title>

      {!examCode && (
        <Input
          placeholder="Chủ đề bài ôn tập"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          style={{ marginBottom: 12 }}
        />
      )}

      {examCode && (
        <>
          <Divider />
          <p><strong>Chủ đề:</strong> {topic}</p>
          <p><strong>Mã bài ôn tập:</strong> {examCode}</p>
          <Divider />
        </>
      )}

      <TextArea
        placeholder="Nội dung câu hỏi"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        rows={3}
        style={{ marginBottom: 8 }}
      />
      {options.map((opt, i) => (
        <Input
          key={i}
          placeholder={`Lựa chọn ${i + 1}`}
          value={opt}
          onChange={e => {
            const newOpts = [...options];
            newOpts[i] = e.target.value;
            setOptions(newOpts);
          }}
          style={{ marginBottom: 8 }}
        />
      ))}
      <Select
        placeholder="Đáp án đúng"
        value={correctAnswer}
        onChange={value => setCorrectAnswer(value)}
        style={{ marginBottom: 12, width: '100%' }}
      >
        {options.map((opt, idx) => (
          <Option key={idx} value={opt}>{opt}</Option>
        ))}
      </Select>

      <Space>
        <Button type="primary" onClick={handleAddToList}>Thêm vào danh sách</Button>
        <Button danger onClick={handleSubmitAll}>Gửi toàn bộ ({questionList.length} câu)</Button>
      </Space>

      <Divider />
      {questionList.length > 0 && (
        <>
          <Title level={4}>Danh sách câu hỏi đã thêm</Title>
          <List
            bordered
            dataSource={questionList}
            renderItem={(q, i) => (
              <List.Item>
                <strong>Câu {i + 1}:</strong> {q.question}
              </List.Item>
            )}
          />
        </>
      )}
    </div>
  );
};

export default CreatePracticeQuestion;
