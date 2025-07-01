import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Form,
    Input,
    Button,
    Avatar,
    Upload,
    DatePicker,
    Select,
    Row,
    Col,
    Typography,
    Divider,
    Space,
    message,
    Modal,
    Spin,
    Badge,
    Statistic,
    Tag
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    TeamOutlined,
    TrophyOutlined,
    BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [userStats, setUserStats] = useState({
        totalTests: 0,
        completedTests: 0,
        averageScore: 0,
        totalClasses: 0
    });
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const API_BASE = 'http://localhost:9999/api';

    // Load user data
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userData);

            // Fetch full user profile from API
            const response = await fetch(`${API_BASE}/users/${user._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const fullUserData = await response.json();
                setUser(fullUserData.data);
                form.setFieldsValue({
                    ...fullUserData.data,
                    dob: fullUserData.data.dob ? dayjs(fullUserData.data.dob) : null
                });
                await loadUserStats(fullUserData.data._id, token);


                // Load user statistics
                await loadUserStats(user._id, token);
            } else {
                message.error('Không thể tải thông tin người dùng');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            message.error('Có lỗi xảy ra khi tải hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const loadUserStats = async (userId, token) => {
        try {
            const response = await fetch(`${API_BASE}/practice-results`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const results = await response.json();

                // Lọc các kết quả theo userId hiện tại
                const userResults = results.filter(r => r.userId === userId);

                const totalTests = userResults.length;
                const completedTests = userResults.length;
                const averageScore = userResults.length > 0
                    ? (userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length).toFixed(1)
                    : 0;
                const totalClasses = new Set(userResults.map(r => r.examCode)).size;

                setUserStats({
                    totalTests,
                    completedTests,
                    averageScore: parseFloat(averageScore),
                    totalClasses
                });
            } else {
                console.error('Không thể tải thống kê practice');
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        }
    };


    const handleSave = async (values) => {
        try {
            const token = localStorage.getItem('token');

            // Format date for API
            const formattedValues = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null
            };

            const response = await fetch(`${API_BASE}/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedValues)
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.data);
                localStorage.setItem('user', JSON.stringify(result.data));

                setIsEditing(false);
                message.success('Cập nhật hồ sơ thành công!');

                // Trigger header update
                window.dispatchEvent(new Event('loginSuccess'));
            } else {
                const error = await response.json();
                message.error(error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Có lỗi xảy ra khi cập nhật hồ sơ');
        }
    };
    const getAvatarUrl = (path) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `http://localhost:9999${path}`;
    };

    const handleAvatarUpload = async (file) => {
        try {
            setUploading(true);
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch(`${API_BASE}/users/${user._id}/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                const updatedUser = { ...user, avatar: result.avatarUrl };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                message.success('Cập nhật ảnh đại diện thành công!');

                // Trigger header update
                window.dispatchEvent(new Event('loginSuccess'));
            } else {
                message.error('Có lỗi xảy ra khi tải lên ảnh đại diện');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            message.error('Có lỗi xảy ra khi tải lên ảnh đại diện');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = () => {
        Modal.confirm({
            title: 'Xác nhận xóa tài khoản',
            content: 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
            okText: 'Xóa tài khoản',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_BASE}/users/${user._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        localStorage.clear();
                        message.success('Tài khoản đã được xóa thành công');
                        navigate('/login');
                    } else {
                        message.error('Có lỗi xảy ra khi xóa tài khoản');
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    message.error('Có lỗi xảy ra khi xóa tài khoản');
                }
            }
        });
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ có thể tải lên file hình ảnh!');
                return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Kích thước file phải nhỏ hơn 2MB!');
                return false;
            }

            handleAvatarUpload(file);
            return false; // Prevent auto upload
        },
        showUploadList: false
    };

    if (loading) {
        return (
            <Layout>
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Spin size="large" />
                </Content>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Title level={3}>Không tìm thấy thông tin người dùng</Title>
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </Button>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout>
            <Content style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header Card */}
                    <Card
                        style={{
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 50%, #13c2c2 100%)',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        <Row align="middle" gutter={24}>
                            <Col>
                                <div style={{ position: 'relative' }}>
                                    <Avatar
                                        size={100}
                                        src={getAvatarUrl(user.avatar)}
                                        icon={!user.avatar && <UserOutlined />}
                                    />

                                    <Upload {...uploadProps}>
                                        <Button
                                            type="primary"
                                            icon={<CameraOutlined />}
                                            size="small"
                                            loading={uploading}
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                padding: 0
                                            }}
                                        />
                                    </Upload>
                                </div>
                            </Col>
                            <Col flex={1}>
                                <Title level={2} style={{ color: 'white', margin: 0 }}>
                                    {user.fullName || 'Chưa cập nhật tên'}
                                </Title>
                                <Space direction="vertical" style={{ marginTop: '8px' }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        <MailOutlined /> {user.email}
                                    </Text>
                                    {user.phone && (
                                        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <PhoneOutlined /> {user.phone}
                                        </Text>
                                    )}
                                    <Tag color="gold">
                                        <TeamOutlined /> {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                                    </Tag>
                                </Space>
                            </Col>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                                    onClick={() => setIsEditing(!isEditing)}
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderColor: 'rgba(255,255,255,0.3)'
                                    }}
                                >
                                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={24}>
                        {/* Statistics Cards */}
                        <Col xs={24} lg={8}>
                            <Card title="Thống kê học tập" style={{ marginBottom: '24px' }}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Tổng bài thi"
                                            value={userStats.totalTests}
                                            prefix={<BookOutlined />}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Đã hoàn thành"
                                            value={userStats.completedTests}
                                            prefix={<TrophyOutlined />}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Điểm trung bình"
                                            value={userStats.averageScore}
                                            suffix="/ 10"
                                            precision={1}
                                            valueStyle={{ color: '#f5222d' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ marginTop: '16px' }}>
                                        <Statistic
                                            title="Lớp tham gia"
                                            value={userStats.totalClasses}
                                            prefix={<TeamOutlined />}
                                            valueStyle={{ color: '#722ed1' }}
                                        />
                                    </Col>
                                </Row>
                            </Card>

                            {/* Account Info */}
                            <Card title="Thông tin tài khoản">
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>ID:</Text>
                                        <br />
                                        <Text code>{user._id}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Ngày tạo:</Text>
                                        <br />
                                        <Text>
                                            <CalendarOutlined /> {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text strong>Cập nhật lần cuối:</Text>
                                        <br />
                                        <Text>
                                            <CalendarOutlined /> {dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                    <Divider />
                                    <Button
                                        danger
                                        onClick={handleDeleteAccount}
                                        style={{ width: '100%' }}
                                    >
                                        Xóa tài khoản
                                    </Button>
                                </Space>
                            </Card>
                        </Col>

                        {/* Profile Form */}
                        <Col xs={24} lg={16}>
                            <Card title="Thông tin cá nhân">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSave}
                                    disabled={!isEditing}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Họ và tên"
                                                name="fullName"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined />}
                                                    placeholder="Nhập họ và tên"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email!' },
                                                    { type: 'email', message: 'Email không hợp lệ!' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined />}
                                                    placeholder="Nhập email"
                                                    size="large"
                                                    disabled // Email thường không cho phép thay đổi
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[
                                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined />}
                                                    placeholder="Nhập số điện thoại"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Giới tính"
                                                name="gender"
                                            >
                                                <Select
                                                    placeholder="Chọn giới tính"
                                                    size="large"
                                                    allowClear
                                                >
                                                    <Option value="male">Nam</Option>
                                                    <Option value="female">Nữ</Option>
                                                    <Option value="other">Khác</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Ngày sinh"
                                                name="dob"
                                            >
                                                <DatePicker
                                                    placeholder="Chọn ngày sinh"
                                                    style={{ width: '100%' }}
                                                    size="large"
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => current && current.isAfter(dayjs())}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label="Vai trò"
                                                name="role"
                                            >
                                                <Select
                                                    placeholder="Vai trò"
                                                    size="large"
                                                    disabled // Role thường không cho phép user tự thay đổi
                                                >
                                                    <Option value="user">Học viên</Option>
                                                    <Option value="admin">Quản trị viên</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {isEditing && (
                                        <div style={{ textAlign: 'right', marginTop: '24px' }}>
                                            <Space>
                                                <Button onClick={() => setIsEditing(false)}>
                                                    Hủy
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    icon={<SaveOutlined />}
                                                    size="large"
                                                >
                                                    Lưu thay đổi
                                                </Button>
                                            </Space>
                                        </div>
                                    )}
                                </Form>
                            </Card>

                            {/* Password Change Section */}
                            <Card
                                title="Đổi mật khẩu"
                                style={{ marginTop: '24px' }}
                            >
                                <Paragraph type="secondary">
                                    Để bảo mật tài khoản, bạn nên thay đổi mật khẩu định kỳ.
                                </Paragraph>
                                <Button
                                    type="primary"
                                    onClick={() => navigate('/change-password')}
                                >
                                    Đổi mật khẩu
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default Profile;