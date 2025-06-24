import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const QuestionsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:9999/api/questions', values, {
        withCredentials: true
      });
      message.success('Thêm câu hỏi thành công!');
      form.resetFields();
    } catch (err) {
      message.error('Lỗi khi thêm câu hỏi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Thêm Câu Hỏi</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="questionText" label="Nội dung câu hỏi" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="options" label="Các lựa chọn" rules={[{ required: true }]}>
          <Select mode="tags" tokenSeparators={[',']} placeholder="Nhập các lựa chọn, nhấn Enter để thêm" />
        </Form.Item>

        <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="examId" label="Mã đề thi (examId)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm câu hỏi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default QuestionsPage;
