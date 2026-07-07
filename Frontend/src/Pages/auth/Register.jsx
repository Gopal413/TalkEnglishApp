import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Grid, 
    Container, 
    CircularProgress, 
    Alert, 
    Paper 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { completeRegistration } from '../../api/authApi';

function Register() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.userEmail;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Local state for all registration inputs
    const [formData, setFormData] = useState({
        name: '', 
        password: '', 
        phone: '', 
        age: '', 
        state: '', 
        country: ''
    });
    
    // Separate local state just for checking on the frontend
    const [confirmPassword, setConfirmPassword] = useState('');

    // Safety Guard: Force user back to step 1 if they try to access this URL directly
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
        setError('');

        // ==========================================
        // 🔒 FRONTEND PASSWORD VALIDATION GUARD
        // ==========================================
        if (formData.password !== confirmPassword) {
            setError("Passwords do not match! Please check again.");
            setLoading(false);
            return; // Stops the execution right here, backend never gets called
        }

        try {
            // ✅ SUCCESS: Send only the clean formData (which includes 'password', NOT 'confirmPassword')
            const result = await completeRegistration(formData);
            alert(result.message);
            navigate('/login'); 
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <PersonAddIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography component="h1" variant="h5" fontWeight="700">Complete Profile</Typography>
                    <Typography variant="body2" color="text.secondary">Creating account for: {email}</Typography>
                </Box>

                {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: '8px' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleFinalSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField required fullWidth label="Full Name" name="name" onChange={handleFormChange} disabled={loading} />
                        </Grid>
                        
                        {/* 🔑 MAIN PASSWORD FIELD */}
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth type="password" label="Password" name="password" onChange={handleFormChange} disabled={loading} />
                        </Grid>
                        
                        {/* 🔑 CONFIRM PASSWORD FIELD */}
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
                        sx={{ mt: 4, py: 1.5, borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Account'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default Register;