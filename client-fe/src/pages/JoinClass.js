import React from 'react';
import { Tabs, Input, Button, message, List, Typography } from 'antd';
import axios from 'axios';

const { TabPane } = Tabs;

class JoinClassPage extends React.Component {
  state = {
    code: '',
    joinedClasses: []
  };

  componentDidMount() {
    this.fetchJoinedClasses();
  }

  fetchJoinedClasses = async () => {
    try {
      const res = await axios.get('http://localhost:9999/api/join-class', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      this.setState({ joinedClasses: res.data });
    } catch (err) {
      console.error(err);
      message.error('Không thể tải danh sách lớp đã tham gia');
    }
  };

  handleJoinClass = async () => {
    const { code } = this.state;
    if (!code.trim()) {
      return message.warning('Vui lòng nhập mã lớp');
    }

    try {
      await axios.post('http://localhost:9999/api/join-class', { code }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });
      message.success('Tham gia lớp thành công!');
      this.setState({ code: '' });
      this.fetchJoinedClasses(); // reload danh sách
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Lỗi khi tham gia lớp');
    }
  };

  render() {
    const { code, joinedClasses } = this.state;

    return (
      <div style={{ maxWidth: 600, margin: 'auto' }}>
        <h2>Tham gia lớp học</h2>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Nhập mã lớp" key="1">
            <Input
              placeholder="Nhập mã lớp"
              value={code}
              onChange={(e) => this.setState({ code: e.target.value })}
              style={{ marginBottom: 12 }}
            />
            <Button type="primary" onClick={this.handleJoinClass}>
              Tham gia
            </Button>
          </TabPane>

          <TabPane tab="Lớp đã tham gia" key="2">
            <List
              bordered
              dataSource={joinedClasses}
              renderItem={item => (
                <List.Item>
                  <Typography.Text strong>{item.name}</Typography.Text> - Mã: {item.code}
                </List.Item>
              )}
              locale={{ emptyText: 'Chưa tham gia lớp nào' }}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default JoinClassPage;
