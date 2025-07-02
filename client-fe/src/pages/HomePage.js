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
    if (userObj.role === 'admin') {
      navigate('/admin/home'); // 👉 Chuyển admin sang trang riêng
    } else {
      setUser(userObj); // Chỉ gán user thường
    }
  } catch (error) {
    localStorage.clear();
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

  if (isLoading) return <div>Đang tải...</div>;
  if (!user) return null;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2>👋 Xin chào, {user.fullName || user.email}</h2>
          <p>Vai trò: {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Đăng xuất
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        <div style={cardStyle}>
          <h3>Ôn tập</h3>
          <p>Quản lý các câu hỏi ôn tập của bạn</p>
          <button
            onClick={() => navigate('/practice ')}
            style={buttonStyle('#fd7e14')}
          >
            Xem các câu hỏi
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Bài thi</h3>
          <p>Truy cập các bài thi có sẵn</p>
          <button
            onClick={() => navigate('/exams')}
            style={buttonStyle('#007bff')}
          >
            Xem bài thi
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Lớp học</h3>
          <p>Quản lý các lớp học của bạn</p>
          <button
            onClick={() => {
              if (user.role === 'admin') {
                navigate('/admin/classes');
              } else {
                navigate('/join-class');
              }
            }}
            style={buttonStyle('#28a745')}
          >
            {user.role === 'admin' ? 'Xem lớp học' : 'Tham gia lớp'}
          </button>
        </div>

        <div style={cardStyle}>
          <h3>Lịch sử</h3>
          <p>Xem kết quả bài thi đã làm</p>
          <button
            onClick={() => navigate('/user/results')}
            style={buttonStyle('#ffc107', 'black')}
          >
            Xem lịch sử
          </button>
        </div>

        {user.role === 'admin' && (
          <div style={{
            ...cardStyle,
            backgroundColor: '#fff3cd'
          }}>
            <h3>Quản trị</h3>
            <p>Các chức năng dành cho admin</p>
            <button
              onClick={() => navigate('/admin')}
              style={buttonStyle('#6f42c1')}
            >
              Trang quản trị
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Styles helper
const cardStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#f8f9fa',
  cursor: 'pointer'
};

const buttonStyle = (bgColor, color = 'white') => ({
  padding: '8px 16px',
  backgroundColor: bgColor,
  color: color,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

export default HomePage;
