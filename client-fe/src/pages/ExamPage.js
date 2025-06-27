import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import axios from 'axios';

const PracticeExam = () => {
  const [examCode, setExamCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const handleFetch = async () => {
    try {
      const res = await axios.post('http://localhost:9999/api/practice-questions/start', {
        examCode
      }, {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });

      setQuestions(res.data.questions);
      setAnswers({});
      message.success('Bắt đầu bài ôn tập!');
    } catch (err) {
      console.error(err);
      message.error('Không tìm thấy bài ôn tập!');
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) correct++;
    });

    message.success(`Bạn đã làm đúng ${correct}/${questions.length} câu`);
  };

  return (
    <div>
      <h3>Làm bài ôn tập</h3>
      <Input.Search
        placeholder="Nhập mã bài ôn tập (examCode)"
        value={examCode}
        onChange={e => setExamCode(e.target.value)}
        onSearch={handleFetch}
        enterButton="Bắt đầu"
        style={{ maxWidth: 400 }}
      />

      {questions.map((q, idx) => (
        <div key={q._id} style={{ marginTop: 20 }}>
          <strong>{idx + 1}. {q.question}</strong>
          {q.options.map(opt => (
            <div key={opt}>
              <input
                type="radio"
                name={`q-${q._id}`}
                value={opt}
                onChange={() => setAnswers({ ...answers, [q._id]: opt })}
              /> {opt}
            </div>
          ))}
        </div>
      ))}

      {questions.length > 0 && (
        <Button type="primary" style={{ marginTop: 20 }} onClick={handleSubmit}>
          Nộp bài
        </Button>
      )}
    </div>
  );
};

export default PracticeExam;
