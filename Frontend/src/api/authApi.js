import axiosInstance from './axiosInstance';

// ==========================================
// REGISTRATION PIPELINE
// ==========================================

// Step 1: Send OTP to email
export const sendOtpOnly = async (email) => {
    const response = await axiosInstance.post('/auth/register/send-otp', { email });
    return response.data;
};

// Step 2: Verify OTP
export const verifyOtpOnly = async (otp) => {
    const response = await axiosInstance.post('/auth/register/verify-otp', { otp });
    return response.data;
};

// Step 3: Complete registration form profile data
export const completeRegistration = async (profileData) => {
    // profileData is an object: { name, password, phone, age, state, country }
    const response = await axiosInstance.post('/auth/register/complete', profileData);
    return response.data;
};

// ==========================================
// AUTHENTICATION PIPELINE
// ==========================================

// User/Admin Login
export const loginUser = async (email, password,loginWithOTP) => {
    const response = await axiosInstance.post('/auth/login', { email, password, loginWithOTP });
    return response.data;
};

// Step 2:Login Verify OTP
export const verifyLoginOtp = async (otp) => {
    const response = await axiosInstance.post('/auth/login/verify-otp', { otp });
    return response.data;
};

// Resend Login OTP
export const resendLoginOtp = async () => {
    const response = await axiosInstance.post("/auth/login/resend-otp");

    return response.data;
};

// Get current user profile (protected)
export const getUserProfile = async () => {
    // The leading '/' makes the path absolute from the host, ignoring the baseURL's path part.
    const response = await axiosInstance.get('/user/profile');
    return response.data;
};

// 🚩 NEW PROTECTED ROUTE: Send first-time choices to database
export const submitOnboardingData = async (onboardingPayload) => {
    // Expects payload structure: { level, goal, dailyReminder }
    const response = await axiosInstance.put('/user/onboarding', onboardingPayload);
    return response.data;
};

// Fetch user progress statistics
export const getUserProgress = async () => {
    const response = await axiosInstance.get('/user/progress');
    return response.data;
};

// Update user settings configuration
export const updateUserSettings = async (settingsPayload) => {
    // settingsPayload is: { level, goal, dailyReminder }
    const response = await axiosInstance.put('/user/settings', settingsPayload);
    return response.data;
};

// Translate English text to target native language using AI
export const translateTextApi = async (text, targetLanguage) => {
    const response = await axiosInstance.post('/user/translate', { text, targetLanguage });
    return response.data;
};

// ==========================================
// PASSWORD RECOVERY PIPELINE
// ==========================================
// Step 1: Frontend sends email -> Backend drops 'reset_email' cookie
export const forgetPassword = async (email) => {
    const response = await axiosInstance.post('/auth/password/forget', { email });
    return response.data;
};

// Step 2: Frontend sends otp and optional email backup
export const verifyResetOtp = async (otp, email) => {
    const response = await axiosInstance.post('/auth/password/verify-otp', { otp, email });
    return response.data;
};

// Step 3: Frontend sends newPassword and optional email backup
export const resetPassword = async (newPassword, email) => {
    const response = await axiosInstance.post('/auth/password/reset', { newPassword, email });
    return response.data;
};

// ==========================================
// LESSONS API
// ==========================================

// Get all lessons with the user's completion status
export const getAllLessonsApi = async () => {
    const response = await axiosInstance.get('/lessons');
    return response.data;
};

// Get full content of a single lesson (steps + quiz)
export const getLessonByIdApi = async (lessonId) => {
    const response = await axiosInstance.get(`/lessons/${lessonId}`);
    return response.data;
};

// Submit quiz result and mark lesson as completed (one-time only)
export const completeLessonApi = async (lessonId, score, total) => {
    const response = await axiosInstance.post(`/lessons/${lessonId}/complete`, { score, total });
    return response.data;
};

// Check grammar of user-submitted text
export const checkGrammarApi = async (text, conversationId) => {
    const response = await axiosInstance.post('/api/ai/grammar', { text, conversationId });
    return response.data;
};