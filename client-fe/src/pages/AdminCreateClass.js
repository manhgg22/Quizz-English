import React from 'react';
import { Input, Button, message } from 'antd';
import axios from 'axios';

class AdminCreateClass extends React.Component {
  state = {
    name: '',
    classCode: ''
  };

  handleInputChange = (e) => {
    this.setState({ name: e.target.value });
  };

  handleCreateClass = async () => {
    const { name } = this.state;

    if (!name.trim()) {
      return message.warning('Vui lòng nhập tên lớp');
    }

    try {
      const res = await axios.post('http://localhost:9999/api/classes', { name }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      });

      this.setState({ classCode: res.data.code });
      message.success('Tạo lớp thành công!');
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Lỗi khi tạo lớp');
    }
  };

  render() {
    const { name, classCode } = this.state;

    return (
      <div style={{ maxWidth: 400 }}>
        <h2>Tạo lớp học</h2>
        <Input
          placeholder="Tên lớp học"
          value={name}
          onChange={this.handleInputChange}
        />
        <Button
          type="primary"
          style={{ marginTop: 12 }}
          onClick={this.handleCreateClass}
        >
          Tạo lớp
        </Button>

        {classCode && (
          <p style={{ marginTop: 16 }}>
            <strong>Mã lớp:</strong> {classCode}
          </p>
        )}
      </div>
    );
  }
}

export default AdminCreateClass;
