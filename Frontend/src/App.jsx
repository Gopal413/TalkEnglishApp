import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import EmailForm from './Pages/auth/EmailForm';
import VerifyOtp from './Pages/auth/VerifyOtp';
import Register from './Pages/auth/Register';
import Login from './Pages/auth/Login';
import ForgotPassword from './Pages/auth/ForgetPassword';
import ResetOtpForm from './Pages/auth/ResetOtpForm';
import ResetPassword from './Pages/auth/ResetPassword';
import ProtectedRoute from './Components/layout/ProtectedRoute';
import SuperAdminRoute from './Components/layout/SuperAdminRoute';
import Dashboard from './Pages/Users/DashBoard';
import Onboarding from './Pages/Users/Onboarding';
import Navbar from './Pages/Users/Navbar';
import AiChat from './Pages/Users/AiChat';
import Progress from './Pages/Users/Progress';
import Settings from './Pages/Users/Settings';
import Lessons from './Pages/Users/Lessons';
import LessonViewer from './Pages/Users/LessonViewer';

// SuperAdmin Pages
import SuperAdminLayout from './Pages/SuperAdmin/SuperAdminLayout';
import SuperAdminDashboard from './Pages/SuperAdmin/SuperAdminDashboard';
import UsersPage from './Pages/SuperAdmin/UsersPage';
import UserDetailPage from './Pages/SuperAdmin/UserDetailPage';
import AdminsPage from './Pages/SuperAdmin/AdminsPage';
import AdminDetailPage from './Pages/SuperAdmin/AdminDetailPage';
import LessonsPage from './Pages/SuperAdmin/LessonsPage';
import LessonFormPage from './Pages/SuperAdmin/LessonFormPage';
import LeaderboardPage from './Pages/SuperAdmin/LeaderboardPage';

// Admin Pages
import AdminLayout from './Pages/Admin/AdminLayout';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AdminUsersPage from './Pages/Admin/AdminUsersPage';
import AdminLessonsPage from './Pages/Admin/AdminLessonsPage';
import AdminRoute from './Components/layout/AdminRoute';

// Hide navbar on superadmin/admin routes
function AppNavbar() {
    const location = useLocation();
    if (location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) return null;
    return <Navbar />;
}

function App() {
    return (
        <Router>
            <AppNavbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<EmailForm />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/complete-profile" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Password Reset Flow */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-otp" element={<ResetOtpForm />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* 🔒 Protected User Routes */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/conversation" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
                <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />

                {/* 👑 SuperAdmin Routes */}
                <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
                    <Route index element={<SuperAdminDashboard />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="users/:id" element={<UserDetailPage />} />
                    <Route path="admins" element={<AdminsPage />} />
                    <Route path="admins/:id" element={<AdminDetailPage />} />
                    <Route path="lessons" element={<LessonsPage />} />
                    <Route path="lessons/new" element={<LessonFormPage />} />
                    <Route path="lessons/:id/edit" element={<LessonFormPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                </Route>

                {/* 🛡️ Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="lessons" element={<AdminLessonsPage />} />
                    <Route path="lessons/new" element={<LessonFormPage isAdminMode={true} />} />
                    <Route path="lessons/:id/edit" element={<LessonFormPage isAdminMode={true} />} />
                    <Route path="leaderboard" element={<LeaderboardPage isAdminMode={true} />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
