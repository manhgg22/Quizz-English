import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // đảm bảo App.js nằm đúng cùng cấp src
import 'antd/dist/reset.css'; // Dành cho Ant Design v5+
import './index.css'; // Thêm file CSS tùy chỉnh nếu cần

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
