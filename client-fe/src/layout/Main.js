import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ExamPage from '../pages/ExamPage';
import ClassPage from '../pages/ClassPage';
import HistoryPage from '../pages/HistoryPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import PrivateRoute from '../pages/PrivateRoute';
import ForgotPasswordPage from '../pages/ForgetPassword';
import Emty from '../pages/Emty';
import QuestionsPage from '../pages/QuestionsPage'
import AdminCreateClass from '../pages/AdminCreateClass';
import JoinClass from '../pages/JoinClass';
import CreatePracticeQuestion from '../pages/CreatePracticeQuestion';
import EnterPracticeExam from '../pages/EnterPracticeExam';
import PracticeResults from '../pages/PracticeResults';
import AdminHomePage from '../pages/AdminHomePage';
import AdminScores from '../pages/AdminScores';
import PracticeStart from '../pages/PracticeStart';
import AdminCreatePraticeQuestion from '../pages/AdminCreatePraticeQuestion';
import Help from '../pages/Help';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import GoogleCallback from '../pages/google-callback';

const Main = () => {
  const location = useLocation();
  
  // Các trang không cần padding và minHeight
  const fullScreenPages = ['/login', '/register', '/forgot-password', '/welcome'];
  const isFullScreenPage = fullScreenPages.includes(location.pathname);

  return (
    <main style={{ 
      padding: isFullScreenPage ? '0' : '20px', 
      minHeight: isFullScreenPage ? '100vh' : '80vh' 
    }}>
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
          path="/admin/exams"
          element={
            <PrivateRoute>
              <AdminCreatePraticeQuestion />
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
              <PracticeResults />
            </PrivateRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <PrivateRoute>
              <EnterPracticeExam />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/home"
          element={
            <PrivateRoute>
              <AdminHomePage />
            </PrivateRoute>
          }
        />
        <Route path="/admin/practice-results" element={<AdminScores />} />
        <Route path="/practice/start" element={<PracticeStart />} />
         <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/google-callback" element={<GoogleCallback />} />



        {/* Root redirect - check authentication */}
        <Route
          path="/"
          element={<AuthRedirect />}
        />
        <Route path="/questions" element={<QuestionsPage />} />
           <Route path="/help" element={<Help />} />
        <Route path="/practice" element={<CreatePracticeQuestion />} />
        <Route path="/admin/classes" element={<AdminCreateClass />} />
        <Route path="/join-class" element={<JoinClass />} />

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