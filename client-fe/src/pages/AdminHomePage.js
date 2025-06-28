import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import {
  PlusCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  MessageOutlined,
  LinkOutlined,
  TagOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminHomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Tạo lớp học',
      description: 'Tạo các lớp học mới để quản lý sinh viên',
      icon: <PlusCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      action: () => navigate('/admin/classes')
    },
    {
      title: 'Gán bài ôn tập',
      description: 'Gán examCode cho lớp học cụ thể',
      icon: <LinkOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      action: () => navigate('/admin/assign-exam')
    },
    {
      title: 'Gửi thông báo',
      description: 'Gửi tin nhắn cho lớp học đã tạo',
      icon: <MessageOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
      action: () => navigate('/admin/notifications')
    },
    {
      title: 'Xem điểm theo lớp',
      description: 'Xem kết quả bài ôn tập của từng học sinh',
      icon: <BarChartOutlined style={{ fontSize: 32, color: '#f5222d' }} />,
      action: () => navigate('/admin/scores')
    },
    {
      title: 'Quản lý chủ đề',
      description: 'Tạo, sửa, xóa chủ đề bài ôn tập',
      icon: <TagOutlined style={{ fontSize: 32, color: '#a0d911' }} />,
      action: () => navigate('/admin/topics')
    },
    {
      title: 'Xuất điểm Excel',
      description: 'Tải xuống kết quả bài làm của học sinh',
      icon: <DownloadOutlined style={{ fontSize: 32, color: '#531dab' }} />,
      action: () => navigate('/admin/export')
    },
    {
      title: 'Quản lý học sinh',
      description: 'Xem danh sách học sinh trong lớp',
      icon: <TeamOutlined style={{ fontSize: 32, color: '#fa541c' }} />,
      action: () => navigate('/admin/classes')
    },
    {
      title: 'Tạo câu hỏi ôn tập',
      description: 'Thêm câu hỏi ôn tập vào hệ thống',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#2f54eb' }} />,
      action: () => navigate('/admin/exams')
    }
  ];

  return (
    <div style={{ padding: '30px' }}>
      <Title level={2}>Trang quản trị Admin</Title>
      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              hoverable
              onClick={feature.action}
              style={{ borderRadius: '10px', minHeight: 180 }}
            >
              <div style={{ textAlign: 'center' }}>
                {feature.icon}
                <Title level={4} style={{ marginTop: 10 }}>
                  {feature.title}
                </Title>
                <Text type="secondary">{feature.description}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminHomePage;
