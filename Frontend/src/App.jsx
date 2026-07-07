import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmailForm from './Pages/auth/EmailForm';
import VerifyOtp from './Pages/auth/VerifyOtp';
import Login from './Pages/auth/Login';
import Register from './Pages/auth/Register';
import ProtectedRoute from './Components/layout/ProtectedRoute';
import Dashboard from './Pages/DashBoard';

 // Assuming you have your Login layout sheet created

function App() {
    return (
        <Router>
            <Routes>
                {/* Clean, separated real-project URL routing configuration definitions */}
                <Route path="/" element={<EmailForm />} />
                <Route path="/register" element={<EmailForm />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/complete-profile" element={<Register />} />
                <Route path="/login" element={<Login />} />

                    {/* 🔒 HOOKING UP SECURE PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

                {/* Fallback to sign up page automatically */}
                <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
