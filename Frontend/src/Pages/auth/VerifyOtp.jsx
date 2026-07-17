import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, CircularProgress, Alert, Link } from '@mui/material';
import { verifyOtpOnly, sendOtpOnly } from '../../api/authApi';
import { useSnackbar } from '../../context/SnackbarContext';
import AuthLayout from './AuthLayout';

function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpExpired, setOtpExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    
    const location = useLocation();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    
    const email = location.state?.userEmail; 
    const otpExpiresAt = location.state?.otpExpiresAt;

    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    useEffect(() => {
        if (!otpExpiresAt) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = otpExpiresAt - now;

            if (distance < 0) {
                clearInterval(interval);
                setOtpExpired(true);
                setTimeLeft('Expired');
                setError('Your OTP has expired. Please request a new one.');
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [otpExpiresAt]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }

    }, [resendCooldown]);


    useEffect(() => {
    console.log("Verify OTP page loaded");
}, []);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otpExpired) return;

        setLoading(true);
        setError('');
        try {
            await verifyOtpOnly(otp);
            navigate('/complete-profile', { state: { userEmail: email } }); 
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            const response = await sendOtpOnly(email);
            showSnackbar('A new verification code has been sent.', 'success');
            navigate('/verify-otp', { state: { userEmail: email, otpExpiresAt: response.otpExpiresAt }, replace: true });
            setError('');
            setOtpExpired(false);
            setCanResend(false);
            setResendCooldown(60);
        } catch (err) {
            showSnackbar(err.response?.data?.error || 'Failed to resend code.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Verify OTP" 
            subtitle={`A 6-digit verification code was sent to ${email}`}
            showBackButton
            onBackClick={() => navigate('/register')}
        >
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ width: '100%' }}>
                {timeLeft && (
                    <Typography variant="caption" display="block" color={otpExpired ? "error" : "rgba(255,255,255,0.6)"} textAlign="center" mb={2}>
                        Time left: <strong style={{ color: '#E07B6A' }}>{timeLeft}</strong>
                    </Typography>
                )}
                <TextField
                    required 
                    fullWidth 
                    label="6-Digit Code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)} 
                    disabled={loading || otpExpired} 
                    inputProps={{ maxLength: 6 }}
                    sx={{
                        '& .MuiInputBase-input': {
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
                    disabled={loading || !otp || otpExpired} 
                    sx={{ mt: 3, py: 1.4, borderRadius: '24px', fontWeight: 'bold' }}
                >
                    {loading ? <CircularProgress size={24} sx={{color:'white'}} /> : 'Verify Code'}
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 4, color: 'rgba(255,255,255,0.6)' }}>
                    Didn't receive the code?{' '}
                    {canResend ? (
                        <Link 
                            component="button" 
                            type="button"
                            variant="body2" 
                            onClick={handleResendOtp} 
                            sx={{ color: '#4A9B9B', fontWeight: '800', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                        >
                            Resend Code
                        </Link>
                    ) : (
                        <Typography component="span" variant="body2" sx={{ color: '#fff', fontWeight: '600' }}>
                            Resend in {resendCooldown}s
                        </Typography>
                    )}
                </Typography>
            </Box>
        </AuthLayout>
    );
}

export default VerifyOtp;