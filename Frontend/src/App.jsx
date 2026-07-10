import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import EmailForm from './Pages/auth/EmailForm';
import VerifyOtp from './Pages/auth/VerifyOtp';
import Register from './Pages/auth/Register';
import Login from './Pages/auth/Login';
import ForgotPassword from './Pages/auth/ForgetPassword';
import ResetOtpForm from './Pages/auth/ResetOtpForm';
import ResetPassword from './Pages/auth/ResetPassword';
import ProtectedRoute from './Components/layout/ProtectedRoute';
import Dashboard from './Pages/Users/DashBoard';
import Onboarding from './Pages/Users/Onboarding';
import Navbar from './Pages/Users/Navbar';
import AiChat from './Pages/Users/AiChat';
import Progress from './Pages/Users/Progress';
import Settings from './Pages/Users/Settings';
import Lessons from './Pages/Users/Lessons';
import LessonViewer from './Pages/Users/LessonViewer';

 // Assuming you have your Login layout sheet created

function App() {
    return (
        <Router>
            {/* Navbar now sits outside of Routes to persist across all pages */}
            <Navbar/>
            <Routes>
                {/* Clean, separated real-project URL routing configuration definitions */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<EmailForm />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/complete-profile" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Password Reset Flow */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-otp" element={<ResetOtpForm />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                    {/* 🔒 HOOKING UP SECURE PROTECTED ROUTES */}
        <Route path="/onboarding" element={
        <ProtectedRoute>
            <Onboarding />
        </ProtectedRoute>
    } />

    {/* 🔒 PROTECTED HOME APP VIEW */}
    <Route path="/dashboard" element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    } />

    <Route path="/conversation" element={
        <ProtectedRoute>
            <AiChat />
        </ProtectedRoute>
    } />

    <Route path="/progress" element={
        <ProtectedRoute>
            <Progress />
        </ProtectedRoute>
    } />

    <Route path="/settings" element={
        <ProtectedRoute>
            <Settings />
        </ProtectedRoute>
    } />

    <Route path="/lessons" element={
        <ProtectedRoute>
            <Lessons />
        </ProtectedRoute>
    } />

    <Route path="/lessons/:lessonId" element={
        <ProtectedRoute>
            <LessonViewer />
        </ProtectedRoute>
    } />

                {/* Fallback to sign up page automatically */}
                <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
