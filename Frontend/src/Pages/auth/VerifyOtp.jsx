import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, CircularProgress, Alert, Paper } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { verifyOtpOnly } from '../../api/authApi';

function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    
    // ✅ GRAB SECRET DATA: Safely extracted from router memory context
    const email = location.state?.userEmail; 

    // Guard: Redirect back to step 1 if someone types this URL directly without an email session
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp) return;

        setLoading(true);
        setError('');
        try {
            await verifyOtpOnly(otp); 
            // Forward the validated email context to the final step
            navigate('/complete-profile', { state: { userEmail: email } }); 
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'success.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <LockOpenIcon color="success" sx={{ fontSize: 28 }} />
                </Box>
                <Typography component="h1" variant="h5" fontWeight="700">Enter OTP</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
                    Verification code sent to <strong>{email}</strong>
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField
                        required fullWidth label="6-Digit Code" value={otp}
                        onChange={(e) => setOtp(e.target.value)} disabled={loading}
                        inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '8px', fontSize: '20px' } }}
                    />
                    <Button type="submit" fullWidth variant="contained" color="success" disabled={loading || !otp} sx={{ mt: 3, py: 1.4, borderRadius: '8px', fontWeight: '600' }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default VerifyOtp;