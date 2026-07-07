import React from 'react';
import { useAuth } from '../context/AuthContext'; // Import our custom hook shortcut
import { Box, Typography, Button, Container } from '@mui/material';

function Dashboard() {
    // Extract state and actions globally from Context box with 1 line of code:
    const { user, logout } = useAuth(); 

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ p: 4, border: '1px solid #ddd', borderRadius: '8px' }}>
                <Typography variant="h4">Welcome Back, {user?.name}!</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                    Your registered email profile session is tied to: {user?.email}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mb: 3 }}>
                    Account Role Privileges Level: <strong>{user?.role}</strong>
                </Typography>
                
                <Button variant="contained" color="error" onClick={logout}>
                    Log Out Safely
                </Button>
            </Box>
        </Container>
    );
}

export default Dashboard;