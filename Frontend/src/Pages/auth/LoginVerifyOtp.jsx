// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Box, TextField, Button, Typography, CircularProgress, Alert, Link } from '@mui/material';
// import { verifyLoginOtp, resendLoginOtp } from "../../api/authApi";
// import { useSnackbar } from '../../context/SnackbarContext';
// import AuthLayout from './AuthLayout';
// import { useAuth } from "../../context/AuthContext";

// function LoginVerifyOtp() {
//     const [otp, setOtp] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [resendCooldown, setResendCooldown] = useState(60);
//     const [canResend, setCanResend] = useState(false);
//     const [otpExpired, setOtpExpired] = useState(false);
//     const [timeLeft, setTimeLeft] = useState('');
//     const { login } = useAuth();
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { showSnackbar } = useSnackbar();
    
//     const email = location.state?.email; 
//     const otpExpiresAt = location.state?.otpExpiresAt;

//     useEffect(() => {
//         if (!email) navigate('/login');
//     }, [email, navigate]);

//     useEffect(() => {
//         if (!otpExpiresAt) return;

//         const interval = setInterval(() => {
//             const now = new Date().getTime();
//             const distance = otpExpiresAt - now;

//             if (distance < 0) {
//                 clearInterval(interval);
//                 setOtpExpired(true);
//                 setTimeLeft('Expired');
//                 setError('Your OTP has expired. Please request a new one.');
//                 return;
//             }

//             const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//             setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [otpExpiresAt]);

//     useEffect(() => {
//         if (resendCooldown > 0) {
//             const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
//             return () => clearTimeout(timer);
//         } else {
//             setCanResend(true);
//         }

//     }, [resendCooldown]);

//     const handleOtpSubmit = async (e) => {

//     e.preventDefault();

//     if (!otp || otpExpired) return;

//     setLoading(true);
//     setError("");

//     try {

//         const data = await verifyLoginOtp(otp);

//         if (data.token) {
//             localStorage.setItem("auth_token", data.token);
//         }

//         if (data.refreshToken) {
//             localStorage.setItem("refresh_token", data.refreshToken);
//         }

//         login(data.user);

//         showSnackbar("Login Successful", "success");

//         if (data.user.role === "superadmin") {

//             navigate("/superadmin", { replace: true });

//         } else if (data.user.role === "admin") {

//             navigate("/admin", { replace: true });

//         } else if (!data.user.isOnboarded) {

//             navigate("/onboarding", { replace: true });

//         } else {

//             navigate("/dashboard", { replace: true });

//         }

//     } catch (err) {

//         setError(
//             err.response?.data?.message ||
//             "Invalid or Expired OTP"
//         );

//     } finally {

//         setLoading(false);

//     }

// };

//     const handleResendOtp = async () => {

//     if (!canResend) return;

//     setLoading(true);

//     try {

//         const data = await resendLoginOtp();

//         showSnackbar(data.message, "success");

//         setOtp("");
// setError("");
// setOtpExpired(false);
// setCanResend(false);
// setResendCooldown(60);
// setOtpExpiresAt(data.otpExpiresAt);

//     } catch (err) {

//         showSnackbar(
//             err.response?.data?.message ||
//             "Failed to resend OTP.",
//             "error"
//         );

//     } finally {

//         setLoading(false);

//     }

// };

//     return (
//         <AuthLayout 
//             title="Verify OTP" 
//             subtitle="Enter the 6-digit verification code sent to your email."
//             showBackButton
//             onBackClick={() => navigate('/login')}
//         >
//             {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

//             <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ width: '100%' }}>
//                 {timeLeft && (
//                     <Typography variant="caption" display="block" color={otpExpired ? "error" : "rgba(255,255,255,0.6)"} textAlign="center" mb={2}>
//                         Time left: <strong style={{ color: '#E07B6A' }}>{timeLeft}</strong>
//                     </Typography>
//                 )}
//                 <TextField
//                     required 
//                     fullWidth 
//                     label="6-Digit Code" 
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)} 
//                     disabled={loading || otpExpired} 
//                     inputProps={{ maxLength: 6 }}
//                     sx={{
//                         '& .MuiInputBase-input': {
//                             textAlign: 'center',
//                             letterSpacing: '8px',
//                             fontSize: '22px',
//                             fontWeight: 'bold',
//                             color: '#fff'
//                         }
//                     }}
//                 />
                
//                 <Button 
//                     type="submit" 
//                     fullWidth 
//                     variant="contained" 
//                     disabled={loading || !otp || otpExpired} 
//                     sx={{ mt: 3, py: 1.4, borderRadius: '24px', fontWeight: 'bold' }}
//                 >
//                     {loading ? <CircularProgress size={24} sx={{color:'white'}} /> : 'Verify Code'}
//                 </Button>

//                 <Typography variant="body2" align="center" sx={{ mt: 4, color: 'rgba(255,255,255,0.6)' }}>
//                     Didn't receive the code?{' '}
//                     {canResend ? (
//                         <Link 
//                             component="button" 
//                             type="button"
//                             variant="body2" 
//                             onClick={handleResendOtp} 
//                             sx={{ color: '#4A9B9B', fontWeight: '800', cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
//                         >
//                             Resend Code
//                         </Link>
//                     ) : (
//                         <Typography component="span" variant="body2" sx={{ color: '#fff', fontWeight: '600' }}>
//                             Resend in {resendCooldown}s
//                         </Typography>
//                     )}
//                 </Typography>
//             </Box>
//         </AuthLayout>
//     );
// }

// export default LoginVerifyOtp;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Link,
} from "@mui/material";

import {
    verifyLoginOtp,
    resendLoginOtp,
} from "../../api/authApi";

import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";

function LoginVerifyOtp() {

    const navigate = useNavigate();

    const { showSnackbar } = useSnackbar();

    const { login } = useAuth();

    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [otpExpired, setOtpExpired] = useState(false);

    const [canResend, setCanResend] = useState(false);

    const [resendCooldown, setResendCooldown] = useState(60);

    const [otpExpiresAt, setOtpExpiresAt] = useState(
        Date.now() + 5 * 60 * 1000
    );

    const [timeLeft, setTimeLeft] = useState("");

        useEffect(() => {

        const interval = setInterval(() => {

            const now = Date.now();

            const distance = otpExpiresAt - now;

            if (distance <= 0) {

                clearInterval(interval);

                setOtpExpired(true);

                setTimeLeft("Expired");

                setError("OTP has expired. Please resend OTP.");

                return;

            }

            const minutes = Math.floor(distance / 60000);

            const seconds = Math.floor((distance % 60000) / 1000);

            setTimeLeft(
                `${minutes.toString().padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
            );

        }, 1000);

        return () => clearInterval(interval);

    }, [otpExpiresAt]);



    useEffect(() => {

        if (resendCooldown <= 0) {

            setCanResend(true);

            return;

        }

        const timer = setTimeout(() => {

            setResendCooldown((prev) => prev - 1);

        }, 1000);

        return () => clearTimeout(timer);

    }, [resendCooldown]);

    // ==============================
// Verify Login OTP
// ==============================

const handleOtpSubmit = async (e) => {

    e.preventDefault();

    if (!otp.trim()) {
        setError("Please enter OTP.");
        return;
    }

    if (otpExpired) {
        setError("OTP has expired.");
        return;
    }

    setLoading(true);
    setError("");

    try {

        const data = await verifyLoginOtp(otp.trim());

        if (data.token) {
            localStorage.setItem("auth_token", data.token);
        }

        if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
        }

        login(data.user);

        showSnackbar(
            data.message || "Login Successful",
            "success"
        );

        // Role Based Navigation

        if (data.user.role === "superadmin") {

            navigate("/superadmin", {
                replace: true,
            });

            return;
        }

        if (data.user.role === "admin") {

            navigate("/admin", {
                replace: true,
            });

            return;
        }

        if (!data.user.isOnboarded) {

            navigate("/onboarding", {
                replace: true,
            });

            return;
        }

        navigate("/dashboard", {
            replace: true,
        });

    } catch (err) {

        const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Invalid or Expired OTP.";

        setError(message);

        showSnackbar(message, "error");

        // Session expired

        if (
            message === "Login session expired. Please login again."
        ) {

            navigate("/login", {
                replace: true,
            });

        }

    } finally {

        setLoading(false);

    }

};

// ==============================
// Resend OTP
// ==============================

const handleResendOtp = async () => {

    if (!canResend) return;

    setLoading(true);

    try {

        const data = await resendLoginOtp();

        showSnackbar(
            data.message || "OTP sent successfully.",
            "success"
        );

        // Clear previous OTP
        setOtp("");

        // Reset errors
        setError("");

        // Enable verification again
        setOtpExpired(false);

        // Restart countdown
        setCanResend(false);

        setResendCooldown(60);

        // Restart OTP expiry timer (5 Minutes)

        setOtpExpiresAt(
            data.otpExpiresAt || Date.now() + 5 * 60 * 1000
        );

    } catch (err) {

        const message =
            err.response?.data?.message ||
            "Unable to resend OTP.";

        setError(message);

        showSnackbar(message, "error");

        if (message === "Login session expired. Please login again.") {

            navigate("/login", {
                replace: true,
            });

        }

    } finally {

        setLoading(false);

    }

};

return (

<AuthLayout
    title="Verify Login OTP"
    subtitle="Enter the 6-digit verification code sent to your email."
    showBackButton
    onBackClick={() => navigate("/login")}
>

    {error && (

        <Alert
            severity="error"
            sx={{ mb:2 }}
        >

            {error}

        </Alert>

    )}

    <Box
        component="form"
        onSubmit={handleOtpSubmit}
    >

        <Typography
            align="center"
            sx={{
                mb:2,
                color:otpExpired
                ? "error.main"
                : "text.secondary"
            }}
        >

            Time Left :
            <strong>
                {" "}
                {timeLeft}
            </strong>

        </Typography>

        <TextField

            fullWidth

            label="Enter OTP"

            value={otp}

            onChange={(e)=>setOtp(e.target.value)}

            inputProps={{
                maxLength:6
            }}

            disabled={
                loading ||
                otpExpired
            }

            sx={{
                mb:3,

                "& input":{

                    textAlign:"center",

                    letterSpacing:"8px",

                    fontWeight:"bold",

                    fontSize:"22px"

                }

            }}

        />

        <Button

            fullWidth

            variant="contained"

            type="submit"

            disabled={
                loading ||
                otpExpired ||
                otp.length!==6
            }

        >

            {

                loading

                ?

                <CircularProgress
                    size={24}
                    color="inherit"
                />

                :

                "Verify OTP"

            }

        </Button>

        <Typography

            align="center"

            sx={{
                mt:4
            }}

        >

            Didn't receive OTP?

            {

                canResend

                ?

                <Link

                    component="button"

                    onClick={handleResendOtp}

                    underline="hover"

                    sx={{
                        ml:1,
                        cursor:"pointer"
                    }}

                >

                    Resend OTP

                </Link>

                :

                <Typography
                    component="span"
                    sx={{
                        ml:1
                    }}
                >

                    Resend in {resendCooldown}s

                </Typography>

            }

        </Typography>

    </Box>

</AuthLayout>

);

}

export default LoginVerifyOtp;