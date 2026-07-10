import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, Alert, Grid, Link, InputAdornment } from '@mui/material';
import { EmailOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import { forgetPassword } from '../../api/authApi';
import AuthLayout from './AuthLayout';

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Email field cannot be empty.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await forgetPassword(email);
            navigate('/verify-reset-otp', { state: { 
                userEmail: email,
                otpExpiresAt: response.otpExpiresAt
            }});
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to dispatch password recovery code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Forgot Password" 
            subtitle="Enter your email to receive a password reset security code"
            showBackButton
            onBackClick={() => navigate('/login')}
        >
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>{error}</Alert>}

            <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                    margin="normal" 
                    required 
                    fullWidth 
                    id="email" 
                    label="Email Address" 
                    autoFocus 
                    disabled={loading}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailOutlined sx={{ color: 'rgba(255,255,255,0.5)' }} fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                
                <Button
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    disabled={loading || !email}
                    endIcon={!loading && <ArrowForwardOutlined />}
                    sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
                </Button>
                
                <Grid container sx={{ justifyContent: "center", mt: 2 }}>
                    <Link component={RouterLink} to="/login" variant="body2" fontWeight="600" sx={{ color: '#4A9B9B', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Back to Login
                    </Link>
                </Grid>
            </Box>
        </AuthLayout>
    );
}

export default ForgotPassword;