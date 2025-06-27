import React, { useEffect, useState } from 'react';
import { Table, Typography, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;

const PracticeResults = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('http://localhost:9999/api/practice-results', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        setResults(res.data);
      } catch (err) {
        console.error(err);
        message.error('Lỗi khi lấy kết quả');
      }
    };

    fetchResults();
  }, []);

  const columns = [
    {
      title: 'Mã bài ôn tập',
      dataIndex: 'examCode'
    },
    {
      title: 'Số câu đúng',
      render: (_, record) => `${record.correct}/${record.total}`
    },
    {
      title: 'Điểm',
      dataIndex: 'score'
    },
    {
      title: 'Thời gian làm bài',
      dataIndex: 'submittedAt',
      render: date => moment(date).format('HH:mm DD/MM/YYYY')
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>Lịch sử luyện tập</Title>
      <Table
        columns={columns}
        dataSource={results}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default PracticeResults;
