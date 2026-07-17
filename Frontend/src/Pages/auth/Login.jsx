import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    CircularProgress, 
    InputAdornment,
    IconButton,
    Link,
    Grid
} from '@mui/material';
import { EmailOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from '../../context/SnackbarContext';
import AuthLayout from './AuthLayout';

// Define validation schema with Zod
const loginSchema = z.object({
    email: z.string().email('Invalid email address').nonempty('Email is required'),
    password: z.string().min(1, 'Password is required'),
});

function Login() {
    const { showSnackbar } = useSnackbar();
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // React Hook Form setup
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur'
    });

    //const LoginVerifyOtp = true;

    // const handleLoginSubmit = async (formData) => {
    //     setLoading(true);
    //     try {
    //         const data = await loginUser(formData.email, formData.password,LoginVerifyOtp);
            
    //         if (data.token) localStorage.setItem('auth_token', data.token);
    //         if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
    //         login(data.user); 

    //         // Role-based redirect
    //         if (data.user.role === 'superadmin') {
    //             navigate('/superadmin', { replace: true });
    //         } else if (data.user.role === 'admin') {
    //             navigate('/admin', { replace: true });
    //         } else if (data.user.isOnboarded === false) {
    //             navigate('/onboarding', { replace: true });
    //         } else {
    //             navigate('/dashboard', { replace: true });
    //         }
    //     } catch (err) {
    //         showSnackbar(err.response?.data?.error || 'Invalid email or password combination.', 'error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleLoginSubmit = async (formData) => {

    setLoading(true);

    try {

        const loginWithOTP = true; // Change to false for direct login

        const data = await loginUser(
            formData.email,
            formData.password,
            loginWithOTP
        );

        // OTP required
        if (data.needOTP) {

            showSnackbar("OTP sent successfully.", "success");

            navigate("/login-verify-otp", {
                state: {
                    email: formData.email,
                    otpExpiresAt: data.otpExpiresAt,
                },
            });

            return;
        }

        // Direct Login

        if (data.token) {
            localStorage.setItem("auth_token", data.token);
        }

        if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
        }

        login(data.user);

        if (data.user.role === "superadmin") {

            navigate("/superadmin", { replace: true });

        } else if (data.user.role === "admin") {

            navigate("/admin", { replace: true });

        } else if (!data.user.isOnboarded) {

            navigate("/onboarding", { replace: true });

        } else {

            navigate("/dashboard", { replace: true });

        }

    } catch (err) {

        showSnackbar(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Login failed.",
            "error"
        );

    } finally {

        setLoading(false);

    }

};

    return (
        <AuthLayout 
            title="Welcome Back" 
            subtitle="Sign in to continue your language learning journey"
            showBackButton
            onBackClick={() => navigate('/')}
        >
            <Box component="form" onSubmit={handleSubmit(handleLoginSubmit)} noValidate sx={{ width: '100%' }}>
                {/* EMAIL INPUT FIELD */}
                <TextField
                    margin="normal" 
                    required 
                    fullWidth 
                    id="email" 
                    label="Email Address" 
                    name="email" 
                    autoComplete="email" 
                    autoFocus 
                    disabled={loading}
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined sx={{ color: 'rgba(255,255,255,0.5)' }} fontSize="small" />
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                {/* PASSWORD INPUT FIELD */}
                <TextField
                    margin="normal" 
                    required 
                    fullWidth 
                    name="password" 
                    label="Password" 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    autoComplete="current-password" 
                    disabled={loading}
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
                    <Link component={RouterLink} to="/forgot-password" variant="body2" fontWeight="600" sx={{ color: '#4A9B9B', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        Forgot password?
                    </Link>
                </Box>

                {/* SUBMIT BUTTON */}
                <Button
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    disabled={loading}
                    sx={{ mt: 1, mb: 3, py: 1.4, borderRadius: '24px', fontWeight: 'bold', textTransform: 'none', fontSize: '16px' }}
                >
                    {loading ? <CircularProgress size={24} sx={{color:'white'}} /> : 'Sign In'}
                </Button>

                {/* FOOTER LINK TO SIGN UP PAGE */}
                <Grid container sx={{ justifyContent: "center" }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/register" fontWeight="600" sx={{ color: '#E07B6A', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Grid>
            </Box>
        </AuthLayout>
    );
}

export default Login;