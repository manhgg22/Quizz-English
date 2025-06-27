import React, { useState } from 'react';
import { Input, Button, message, Select } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

const CreatePracticeQuestion = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [topic, setTopic] = useState('');

  // ✅ Hàm sinh mã examCode ngẫu nhiên 6 ký tự
  const generateExamCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async () => {
    if (!question || !correctAnswer || !topic || options.some(o => !o)) {
      return message.warning('Điền đầy đủ thông tin!');
    }

    const examCode = generateExamCode(); // ✅ Tạo mã ngẫu nhiên

    try {
      await axios.post('http://localhost:9999/api/practice-questions', {
        question,
        options,
        correctAnswer,
      
        topic,
        examCode // ✅ Gửi lên backend
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });

      message.success(`Tạo câu hỏi ôn tập thành công! Mã làm bài: ${examCode}`);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setTopic('');
    
    } catch (err) {
      message.error('Lỗi tạo câu hỏi');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h3>Tạo câu hỏi ôn tập</h3>
  
      <Input placeholder="Chủ đề" value={topic} onChange={e => setTopic(e.target.value)} style={{ marginTop: 8 }} />
      <TextArea
        rows={3}
        placeholder="Nội dung câu hỏi"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        style={{ marginTop: 8 }}
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
          style={{ marginTop: 8 }}
        />
      ))}
      <Select
        placeholder="Đáp án đúng"
        value={correctAnswer}
        onChange={value => setCorrectAnswer(value)}
        style={{ marginTop: 8, width: '100%' }}
      >
        {options.map((opt, i) => (
          <Option key={i} value={opt}>
            {opt}
          </Option>
        ))}
      </Select>
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: 12 }}>
        Tạo câu hỏi
      </Button>
    </div>
  );
};

export default CreatePracticeQuestion;
