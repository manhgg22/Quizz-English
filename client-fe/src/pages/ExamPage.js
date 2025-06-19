import React from 'react';
import { useParams } from 'react-router-dom';

const ExamPage = () => {
  const { examCode } = useParams();
  return (
    <div>
      <h2>Đang truy cập đề thi: {examCode}</h2>
      <p>Chức năng hiển thị đề thi sẽ được thêm tại đây.</p>
    </div>
  );
};

export default ExamPage;
