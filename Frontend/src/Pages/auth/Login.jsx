import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Container, 
    CircularProgress, 
    Alert,
    Paper,
    InputAdornment,
    IconButton,
    Link,
    Grid
} from '@mui/material';
import { LockOutlined, EmailOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Import your custom Context hook and your API function
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

// Define validation schema with Zod
const loginSchema = z.object({
    email: z.string().email('Invalid email address').nonempty('Email is required'),
    password: z.string().min(1, 'Password is required'),
});

function Login() {
    const { login } = useAuth(); // Grab the global login brain from context
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    
    // UI Feedback States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // React Hook Form setup
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur' // Validate fields when they lose focus
    });

    // const handleLoginSubmit = async (formData) => {
    //     setLoading(true);
    //     setError('');

    //     try {
    //         // 2. Call your Axios endpoint to check credentials against MongoDB
    //         const data = await loginUser(formData.email, formData.password);
            
    //         // If using the dual-accept model, drop token in localStorage
    //         if (data.token) {
    //             localStorage.setItem('auth_token', data.token);
    //         }

    //         // 3. SUCCESS! Feed user info { id, name, role, email } into global Context memory
    //         login(data.user); 

    //         // 4. Send them smoothly into their secure dashboard area
    //         navigate('/dashboard');

    //     } catch (err) {
    //         // Catches any 400/401/500 errors from Express backend
    //         setError(err.response?.data?.error || 'Invalid email or password combination.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleLoginSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
        // 1. Call your backend API
        const data = await loginUser(formData.email, formData.password);
        
        // 2. Pass just the role into your global context brain
        // This sets user state to something like: { role: 'admin' } or { role: 'user' }
        login({ role: data.role }); 

        // 3. Navigate straight to the dashboard page
        navigate('/dashboard');

    } catch (err) {
        setError(err.response?.data?.error || 'Invalid email or password combination.');
    } finally {
        setLoading(false);
    }
};
    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Clean Top Branding Header */}
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <LockOutlined sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                
                <Typography component="h1" variant="h5" fontWeight="700">
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                    Sign in to access your secure dashboard.
                </Typography>

                {/* Display backend failure messages here */}
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(handleLoginSubmit)} noValidate sx={{ width: '100%' }}>
                    {/* EMAIL INPUT FIELD */}
                    <TextField
                        margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus disabled={loading}
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* PASSWORD INPUT FIELD */}
                    <TextField
                        margin="normal" required fullWidth name="password" label="Password" type={showPassword ? 'text' : 'password'} id="password" autoComplete="current-password" disabled={loading}
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* SUBMIT BUTTON */}
                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.4, borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    {/* FOOTER LINK TO SIGN UP PAGE */}
                    <Grid container justifyContent="center" sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register" fontWeight="600" underline="hover">
                                Sign Up
                            </Link>
                        </Typography>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;