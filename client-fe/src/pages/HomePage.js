import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return null; // Component sẽ redirect đến login
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>👋 Xin chào, {user.email}</h2>
          <p>Vai trò: {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
           cursor: 'pointer'
        }}>
          <h3>Ôn tập</h3>
          <p>Quản lý các câu hỏi ôn tập của bạn</p>
          <button  onClick={() => navigate('/questions')} style={{ padding: '8px 16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Xem các câu hỏi
          </button>
        </div>
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
           cursor: 'pointer'
        }}>
          <h3>Bài thi</h3>
          <p>Truy cập các bài thi có sẵn</p>
          <button style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            Xem bài thi
          </button>
        </div>

        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
           cursor: 'pointer'
        }}>
          <h3>Lớp học</h3>
          <p>Quản lý các lớp học của bạn</p>
          <button style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Xem lớp học
          </button>
        </div>


        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
           cursor: 'pointer'
        }}>
          <h3>Lịch sử</h3>
          <p>Xem kết quả bài thi đã làm</p>
          <button style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Xem lịch sử
          </button>
        </div>

        {user.role === 'admin' && (
          <div style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff3cd'
          }}>
            <h3>Quản trị</h3>
            <p>Các chức năng dành cho admin</p>
            <button style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}>
              Trang quản trị
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;