import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function ProtectedRoute({ children, allowAdminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    // 1. If context is actively checking cookies, show a smooth loading spinner
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // 2. Guard: If user is not authenticated, bounce them to login screen
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Guard: If route is admin-only, and user is a standard role, block access
    if (allowAdminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Authorization Clear: Render the private view component cleanly
    return children;
}

export default ProtectedRoute;