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

    const { user } = useAuth();

    // 3. Redirect Admin/SuperAdmin accessing regular student views (if page is not admin-only)
    if (!allowAdminOnly) {
        if (user?.role === 'superadmin') {
            return <Navigate to="/superadmin" replace />;
        }
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
    }

    // 4. Guard: If route is admin-only, and user is a standard role, block access
    if (allowAdminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // 5. Authorization Clear: Render the private view component cleanly
    return children;
}

export default ProtectedRoute;