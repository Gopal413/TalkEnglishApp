const express = require('express');
const router = express.Router();

// Import all the controller functions we created
const {  
    OnlyEmail,
    verifyOtp, 
    register, 
    login, 
    forgetPassword, 
    verifyResetOtp, 
    resetPassword 
} = require('../Controller/AuthController');
//const { OnlyEmail } = require('../Controller/AuthController');

// ==========================================
// 1. REGISTRATION FLOW (Email First)
// ==========================================
console.log("authcontroller")
// WHY: User submits just their email. Backend sends an OTP and sets 'user_email' cookie.
router.post('/register/send-otp', OnlyEmail);

// WHY: User submits the OTP. Backend checks it against temp memory and flags it as verified.
router.post('/register/verify-otp', verifyOtp);

// WHY: Final step. User submits password, name, phone, age, etc. Backend saves them to MongoDB.
router.post('/register/complete', register);


// ==========================================
// 2. AUTHENTICATION FLOW
// ==========================================

// WHY: User logs in. Backend verifies credentials and issues an HTTP-Only 'auth_token' JWT.
router.post('/login', login);


// ==========================================
// 3. PASSWORD RESET FLOW
// ==========================================

// WHY: User forgets password and enters email. Backend generates OTP inside DB and sets 'reset_email' cookie.
router.post('/password/forget', forgetPassword);

// WHY: User types OTP from email. Backend verifies it's correct before letting them see the new password form.
router.post('/password/verify-otp', verifyResetOtp);

// WHY: User types new password. Backend hashes it, updates MongoDB, and clears out the temporary database OTP fields.
router.post('/password/reset', resetPassword);

module.exports = router;