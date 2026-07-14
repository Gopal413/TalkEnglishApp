import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { verifyResetOtp } from '../../api/authApi';
import AuthLayout from './AuthLayout';

function ResetOtpForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.userEmail;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        
        if (!otp || otp.length !== 6) {
            setError('Verification code must be exactly 6 digits.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await verifyResetOtp(otp, email);
            navigate('/reset-password', { state: { userEmail: email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Enter Reset OTP" 
            subtitle="Please check your inbox and type your 6-digit verification code below"
            showBackButton
            onBackClick={() => navigate('/forgot-password')}
        >
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>{error}</Alert>}

            <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                    required 
                    fullWidth 
                    label="6-Digit Security Code" 
                    disabled={loading} 
                    autoFocus
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    inputProps={{ 
                        maxLength: 6, 
                        style: { 
                            textAlign: 'center', 
                            letterSpacing: '8px', 
                            fontSize: '22px', 
                            fontWeight: 'bold',
                            color: '#fff'
                        } 
                    }}
                />
                <Button
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    color="success" 
                    disabled={loading || !otp}
                    sx={{ mt: 4, py: 1.4, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                </Button>
            </Box>
        </AuthLayout>
    );
}

export default ResetOtpForm;