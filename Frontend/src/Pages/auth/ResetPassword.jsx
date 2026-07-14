import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, CircularProgress, Grid } from '@mui/material';
import { resetPassword } from '../../api/authApi';
import { useSnackbar } from '../../context/SnackbarContext';
import AuthLayout from './AuthLayout';

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.userEmail;
    const { showSnackbar } = useSnackbar();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordSave = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            showSnackbar('Please fill in both fields.', 'error');
            return;
        }
        if (password.length < 6) {
            showSnackbar('Passwords must be at least 6 characters long.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showSnackbar('Passwords do not match!', 'error');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(password, email);
            showSnackbar('Password has been updated successfully. You may now log in.', 'success');
            navigate('/login'); 
        } catch (err) {
            showSnackbar(err.response?.data?.error || 'Database write action rejected.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Reset Password" 
            subtitle="Create a new, strong password for your account"
            showBackButton
            onBackClick={() => navigate('/verify-reset-otp')}
        >
            <Box component="form" onSubmit={handlePasswordSave} noValidate sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required 
                            fullWidth 
                            type="password" 
                            label="New Password" 
                            disabled={loading} 
                            autoFocus
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required 
                            fullWidth 
                            type="password" 
                            label="Confirm New Password" 
                            disabled={loading}
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Grid>
                </Grid>

                <Button
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    disabled={loading || !password || !confirmPassword}
                    sx={{ mt: 4, py: 1.4, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save New Password'}
                </Button>
            </Box>
        </AuthLayout>
    );
}

export default ResetPassword;