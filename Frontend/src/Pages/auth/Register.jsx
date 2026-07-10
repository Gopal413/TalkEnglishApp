import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Grid, 
    CircularProgress, 
    Link
} from '@mui/material';
import { completeRegistration } from '../../api/authApi';
import { useSnackbar } from '../../context/SnackbarContext';
import AuthLayout from './AuthLayout';

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const email = location.state?.userEmail;

    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '', 
        password: '', 
        phone: '', 
        age: '', 
        state: '', 
        country: ''
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== confirmPassword) {
            showSnackbar("Passwords do not match! Please check again.", "error");
            setLoading(false);
            return;
        }

        try {
            await completeRegistration(formData);
            showSnackbar('Account created successfully! Please log in.', 'success');
            navigate('/login'); 
        } catch (err) {
            showSnackbar(err.response?.data?.error || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title="Complete Profile" 
            subtitle={`Setting up your credentials for: ${email}`}
            showBackButton
            onBackClick={() => navigate('/verify-otp', { state: { userEmail: email } })}
        >
            <Box component="form" onSubmit={handleFinalSubmit} noValidate sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField required fullWidth label="Full Name" name="name" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth type="password" label="Password" name="password" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            required 
                            fullWidth 
                            type="password" 
                            label="Confirm Password" 
                            name="confirmPassword" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth label="Phone" name="phone" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth type="number" label="Age" name="age" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth label="State" name="state" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField required fullWidth label="Country" name="country" onChange={handleFormChange} disabled={loading} />
                    </Grid>
                </Grid>

                <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    disabled={loading} 
                    sx={{ mt: 4, py: 1.5, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>

                <Grid container sx={{ justifyContent: "center", mt: 3 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" fontWeight="600" sx={{ color: '#4A9B9B', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Sign In
                        </Link>
                    </Typography>
                </Grid>
            </Box>
        </AuthLayout>
    );
}

export default Register;