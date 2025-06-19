import React, { useState, useEffect } from 'react';

const HomePage = ({ user = { name: 'Nguyễn Văn A', email: 'student@example.com', role: 'student' } }) => {
  const [examCode, setExamCode] = useState('');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentExams, setRecentExams] = useState([]);
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    completedExams: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Mock navigate function for demo
  const navigate = (path) => {
    console.log('Navigating to:', path);
    alert(`Điều hướng đến: ${path}`);
  };

  // Simulate API calls
  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
    fetchRecentExams();
    fetchJoinedClasses();
    fetchNotifications();
  }, [user]);

  const fetchUserData = async () => {
    // Simulate API call
    setStats({
      totalExams: 15,
      averageScore: 8.5,
      completedExams: 12
    });
  };

  const fetchRecentExams = async () => {
    // Simulate recent exams data
    setRecentExams([
      { id: 'EXAM001', title: 'Toán học lớp 12', date: '2024-06-15', score: 9.2, status: 'completed' },
      { id: 'EXAM002', title: 'Vật lý đại cương', date: '2024-06-10', score: 7.8, status: 'completed' },
      { id: 'EXAM003', title: 'Hóa học hữu cơ', date: '2024-06-05', score: null, status: 'in-progress' }
    ]);
  };

  const fetchJoinedClasses = async () => {
    // Simulate joined classes data
    setJoinedClasses([
      { id: 'CLASS001', name: 'Lớp Toán 12A1', teacher: 'Nguyễn Văn A', studentCount: 35 },
      { id: 'CLASS002', name: 'Lớp Vật lý nâng cao', teacher: 'Trần Thị B', studentCount: 28 }
    ]);
  };

  const fetchNotifications = async () => {
    // Simulate notifications
    setNotifications([
      { id: 1, message: 'Bài kiểm tra Toán học sẽ bắt đầu trong 2 giờ', type: 'warning', time: '2 giờ trước' },
      { id: 2, message: 'Điểm bài thi Hóa học đã được cập nhật', type: 'info', time: '1 ngày trước' },
      { id: 3, message: 'Lớp Vật lý có bài tập mới', type: 'info', time: '3 ngày trước' }
    ]);
  };

  const handleJoinExam = async () => {
    if (!examCode.trim()) {
      alert('Vui lòng nhập mã đề thi');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to validate exam code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if exam code exists (simulation)
      const validCodes = ['EXAM001', 'EXAM002', 'EXAM003', 'MATH2024', 'PHYS2024'];
      if (!validCodes.includes(examCode.toUpperCase())) {
        alert('Mã đề thi không hợp lệ hoặc không tồn tại');
        setLoading(false);
        return;
      }

      navigate(`/exam/${examCode}`);
    } catch (error) {
      alert('Có lỗi xảy ra khi tham gia thi. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      alert('Vui lòng nhập mã lớp học');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to validate class code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if class code exists (simulation)
      const validCodes = ['CLASS001', 'CLASS002', 'MATH12A1', 'PHYS2024'];
      if (!validCodes.includes(classCode.toUpperCase())) {
        alert('Mã lớp học không hợp lệ hoặc không tồn tại');
        setLoading(false);
        return;
      }

      navigate(`/class/${classCode}`);
    } catch (error) {
      alert('Có lỗi xảy ra khi tham gia lớp. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleViewHistory = () => {
    navigate('/user/results');
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Clear user data and redirect to login
      console.log('User logged out');
      alert('Đã đăng xuất thành công');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'completed': { text: 'Hoàn thành', color: '#4CAF50' },
      'in-progress': { text: 'Đang làm', color: '#FF9800' },
      'pending': { text: 'Chờ làm', color: '#2196F3' }
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', color: '#9E9E9E' };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        backgroundColor: statusInfo.color,
        color: 'white'
      }}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>👋 Xin chào, {user.name || user.email}</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
            Vai trò: <strong>{user.role === 'student' ? 'Học sinh' : 'Giáo viên'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '50%',
                backgroundColor: '#2196F3',
                color: 'white',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '300px',
                zIndex: 1000,
                marginTop: '0.5rem'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                  <strong>Thông báo</strong>
                </div>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>{notif.message}</p>
                    <small style={{ color: '#666' }}>{notif.time}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleProfile} style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}>
            👤 Hồ sơ
          </button>
          <button onClick={handleLogout} style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f44336',
            color: 'white',
            cursor: 'pointer'
          }}>
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#E3F2FD',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#1976D2' }}>📊 Tổng số bài thi</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{stats.totalExams}</p>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#E8F5E8',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#388E3C' }}>🎯 Điểm trung bình</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{stats.averageScore}/10</p>
        </div>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#FFF3E0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#F57C00' }}>✅ Đã hoàn thành</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 'bold' }}>{stats.completedExams}</p>
        </div>
      </div>

      {/* Main Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>🔑 Tham gia bằng mã đề thi</h3>
          <input
            type="text"
            placeholder="Nhập mã đề (VD: EXAM001)"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '16px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinExam()}
          />
          <button 
            onClick={handleJoinExam}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang xử lý...' : '🚀 Tham gia thi'}
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>🏫 Tham gia lớp học</h3>
          <input
            type="text"
            placeholder="Nhập mã lớp (VD: CLASS001)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '16px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinClass()}
          />
          <button 
            onClick={handleJoinClass}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: loading ? '#ccc' : '#2196F3',
              color: 'white',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Đang xử lý...' : '📚 Vào lớp'}
          </button>
        </div>
      </div>

      {/* Recent Exams */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>📝 Bài thi gần đây</h3>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          overflow: 'hidden'
        }}>
          {recentExams.map(exam => (
            <div key={exam.id} style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#333' }}>{exam.title}</h4>
                <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '14px' }}>
                  Ngày thi: {formatDate(exam.date)}
                </p>
                {exam.score && (
                  <p style={{ margin: '0.25rem 0', color: '#4CAF50', fontWeight: 'bold' }}>
                    Điểm: {exam.score}/10
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {getStatusBadge(exam.status)}
                <button
                  onClick={() => navigate(`/exam/${exam.id}/result`)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #2196F3',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#2196F3',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={handleViewHistory}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#FF9800',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          📜 Xem toàn bộ lịch sử
        </button>
      </div>

      {/* Joined Classes */}
      <div>
        <h3 style={{ color: '#333', marginBottom: '1rem' }}>👥 Lớp học đã tham gia</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {joinedClasses.map(cls => (
            <div key={cls.id} style={{
              padding: '1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              <h4 style={{ margin: 0, color: '#333' }}>{cls.name}</h4>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>
                Giáo viên: {cls.teacher}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#666' }}>
                Học sinh: {cls.studentCount} người
              </p>
              <button
                onClick={() => navigate(`/class/${cls.id}`)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Vào lớp học
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;