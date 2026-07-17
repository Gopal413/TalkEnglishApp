import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, Alert, Grid, Link } from '@mui/material';
import { ArrowForwardOutlined } from '@mui/icons-material';
import { sendOtpOnly } from '../../api/authApi'; 
import AuthLayout from './AuthLayout';

function EmailForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setLoading(true);
        setError(''); 
        
        try {
            const response = await sendOtpOnly(email);
            navigate('/verify-otp', { state: { 
                userEmail: email,
                otpExpiresAt: response.otpExpiresAt 
            }});  
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code');
            console.log("===== API ERROR =====");
    console.log(err);
    console.log(err.response);
    console.log(err.response?.status);
    console.log(err.response?.data);
    console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Create Account" 
            subtitle="Enter your email to receive a 6-digit verification code"
            showBackButton
            onBackClick={() => navigate('/')}
        >
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                    margin="normal" 
                    required 
                    fullWidth 
                    id="email" 
                    label="Email Address" 
                    autoFocus
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={loading}
                />
                <Button
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    disabled={loading || !email}
                    endIcon={!loading && <ArrowForwardOutlined />} 
                    sx={{ mt: 3, py: 1.4, borderRadius: '24px', fontWeight: 'bold' }}
                >
                    {loading ? <CircularProgress size={24} sx={{color:'white'}} /> : 'Get Started'}
                </Button>
            </Box>

            <Grid container sx={{ justifyContent: "center", mt: 4 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" fontWeight="600" sx={{ color: '#E07B6A', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Sign In
                    </Link>
                </Typography>
            </Grid>
        </AuthLayout>
    );
}

export default EmailForm;