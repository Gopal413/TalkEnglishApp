import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, CircularProgress, Alert, Paper } from '@mui/material';
import { EmailOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import { sendOtpOnly } from '../../api/authApi'; 

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
            await sendOtpOnly(email); 
            // ✅ SUCCESS: Pass the email securely in hidden state payload
            navigate('/verify-otp', { state: { userEmail: email } }); 
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '12px' }}>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <EmailOutlined color="primary" sx={{ fontSize: 28 }} />
                </Box>
                <Typography component="h1" variant="h5" fontWeight="700">Verify Email</Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 3 }}>
                    Enter your email to receive a 6-digit verification code.
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleFormSubmit} noValidate sx={{ width: '100%' }}>
                    <TextField
                        margin="normal" required fullWidth id="email" label="Email Address" autoFocus
                        value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                    />
                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading || !email}
                        endIcon={!loading && <ArrowForwardOutlined />} sx={{ mt: 3, py: 1.4, borderRadius: '8px', fontWeight: '600' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default EmailForm;