import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // thêm dòng này
import axios from '../api/axiosInstance';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const navigate = useNavigate(); // khởi tạo navigate

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      const { token, user } = res.data; // giả sử server trả về user object chứa role

      setToken(token);
      setMessage('Login successful');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // điều hướng theo role
      if (user.role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/home'); // trang dành cho user
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" onChange={handleChange} placeholder="Email" />
        <input name="password" type="password" onChange={handleChange} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      {token && <pre>{token}</pre>}
    </div>
  );
};

export default LoginPage;
