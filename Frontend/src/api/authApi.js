import axiosInstance from './axiosInstance';

// ==========================================
// REGISTRATION PIPELINE
// ==========================================

// Step 1: Send OTP to email
export const sendOtpOnly = async (email) => {
    const response = await axiosInstance.post('/register/send-otp', { email });
    return response.data;
};

// Step 2: Verify OTP
export const verifyOtpOnly = async (otp) => {
    const response = await axiosInstance.post('/register/verify-otp', { otp });
    return response.data;
};

// Step 3: Complete registration form profile data
export const completeRegistration = async (profileData) => {
    // profileData is an object: { name, password, phone, age, state, country }
    const response = await axiosInstance.post('/register/complete', profileData);
    return response.data;
};

// ==========================================
// AUTHENTICATION PIPELINE
// ==========================================

// User/Admin Login
export const loginUser = async (email, password) => {
    const response = await axiosInstance.post('/login', { email, password });
    return response.data;
};

// ==========================================
// PASSWORD RECOVERY PIPELINE
// ==========================================

// Step 1: Submit email for forget password request
export const forgetPassword = async (email) => {
    const response = await axiosInstance.post('/password/forget', { email });
    return response.data;
};

// Step 2: Verify reset code OTP
export const verifyResetOtp = async (otp) => {
    const response = await axiosInstance.post('/password/verify-otp', { otp });
    return response.data;
};

// Step 3: Submit new secure password
export const resetPassword = async (newPassword) => {
    const response = await axiosInstance.post('/password/reset', { newPassword });
    return response.data;
};