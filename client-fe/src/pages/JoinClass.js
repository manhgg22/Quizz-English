import React from 'react';
import { Input, Button, message } from 'antd';
import axios from 'axios';

class JoinClass extends React.Component {
  state = {
    code: ''
  };

  handleInputChange = (e) => {
    this.setState({ code: e.target.value });
  };

  handleJoinClass = async () => {
    try {
      const res = await axios.post('/api/join-class', {
        code: this.state.code
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      message.success('Tham gia lớp thành công');
      this.setState({ code: '' });
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Lỗi khi tham gia lớp');
    }
  };

  render() {
    return (
      <div style={{ maxWidth: 400 }}>
        <h2>Tham gia lớp học</h2>
        <Input
          placeholder="Nhập mã lớp"
          value={this.state.code}
          onChange={this.handleInputChange}
        />
        <Button
          type="primary"
          style={{ marginTop: 12 }}
          onClick={this.handleJoinClass}
        >
          Tham gia
        </Button>
      </div>
    );
  }
}

export default JoinClass;
