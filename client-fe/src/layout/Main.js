import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ExamPage from '../pages/ExamPage';
import ClassPage from '../pages/ClassPage';
import HistoryPage from '../pages/HistoryPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from '../pages/PrivateRoute';
import ForgotPasswordPage from '../pages/ForgetPassword';
import Emty from '../pages/Emty';

const Main = () => {
  return (
    <main style={{ padding: '20px', minHeight: '80vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={< Emty/>} />
        
        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/exam/:examCode"
          element={
            <PrivateRoute>
              <ExamPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/class/:classCode"
          element={
            <PrivateRoute>
              <ClassPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/user/results"
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </main>
  );
};

export default Main;