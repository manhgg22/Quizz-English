import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamPage from './pages/ExamPage';
import ClassPage from './pages/ClassPage';
import HistoryPage from './pages/HistoryPage';

const dummyUser = {
  email: 'user@example.com',
  role: 'user'
};

function App() {
  return (
    <Routes>
      <Route path="/home" element={<HomePage user={dummyUser} />} />
      <Route path="/exam/:examCode" element={<ExamPage />} />
      <Route path="/class/:classCode" element={<ClassPage />} />
      <Route path="/user/results" element={<HistoryPage />} />
    </Routes>
  );
}

export default App;
