import React from 'react';
import { useParams } from 'react-router-dom';

const ClassPage = () => {
  const { classCode } = useParams();
  return (
    <div>
      <h2>Lớp học: {classCode}</h2>
      <p>Danh sách bài thi hoặc thành viên sẽ hiển thị tại đây.</p>
    </div>
  );
};

export default ClassPage;
