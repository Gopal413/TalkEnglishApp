import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function SuperAdminRoute({ children }) {
    const { isAuthenticated, isSuperAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f1a' }}>
                <CircularProgress sx={{ color: '#7c3aed' }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isSuperAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default SuperAdminRoute;
