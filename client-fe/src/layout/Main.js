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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Empty/Landing page */}
        <Route path="/welcome" element={<Emty />} />
        
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
          path="/exams"
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
          path="/classes"
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
        
        {/* Root redirect - check authentication */}
        <Route 
          path="/" 
          element={<AuthRedirect />} 
        />
        
        {/* 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

// Component to handle root path authentication check
const AuthRedirect = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // If user is authenticated, redirect to home
  if (token && userData) {
    try {
      JSON.parse(userData); // Validate user data
      return <Navigate to="/home" replace />;
    } catch (error) {
      // Invalid user data, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }
  
  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default Main;