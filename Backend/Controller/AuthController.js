const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../Utils/SentToEmail');
const userModel = require('../Models/userModel');

// Temporary in-memory storage to hold OTP info BEFORE a user is created in MongoDB
const tempOtpStorage = {};

// Helper function to generate a secure 6-digit random number
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


// =========================================================================
// 1. ONLY EMAIL (Send OTP before registration)
// =========================================================================
async function OnlyEmail(req, res) {
    console.log("emailonly")
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Check if user already exists completely in the system
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const otp = generateOtp();

        // WHY: We save this to memory because the database requires Name and Password to create a user.
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
        tempOtpStorage[email] = {
            otp: otp,
            expiresAt: expiresAt,
            isVerified: false
        };

        await sendOTPEmail(email, otp);

        // WHY: We drop the email into a cookie so the frontend doesn't have to resend it on the next step
        res.cookie('user_email', email, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: 'lax' });

        return res.status(200).json({
            message: 'OTP sent successfully!',
            otpExpiresAt: expiresAt // Send expiration timestamp to frontend
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}


// =========================================================================
// 2. VERIFY OTP (Verify email before registration)
// =========================================================================
async function verifyOtp(req, res) {
    try {
        const { otp } = req.body;
        const emailFromCookie = req.cookies.user_email; // WHY: Grab email cleanly from the browser cookie

        if (!emailFromCookie) return res.status(400).json({ error: 'Session expired. Request OTP again.' });
        if (!otp) return res.status(400).json({ error: 'Provide the OTP code' });

        const record = tempOtpStorage[emailFromCookie];
        if (!record || Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP expired.' });

        if (record.otp !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP code.' });

        // WHY: Do NOT clear cookie yet. Mark as true so the 'register' route knows this email is authenticated.
        record.isVerified = true;
        return res.status(200).json({ message: 'Email verified! Proceed to fill out registration form.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}


// =========================================================================
// 3. REGISTER (Save everything to database)
// =========================================================================
async function register(req, res) {
    try {
        const emailFromCookie = req.cookies.user_email;
        const { password, name, phone, age, state, country } = req.body;

        if (!emailFromCookie) return res.status(400).json({ error: 'Session missing. Start over.' });

        // WHY: Verify the user actually passed Step 2 successfully
        const record = tempOtpStorage[emailFromCookie];
        if (!record || !record.isVerified) return res.status(401).json({ error: 'Please verify OTP first.' });

        if (!name || !password || !phone || !age || !state || !country) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to MongoDB database
        const user = await userModel.create({
            name,
            email: emailFromCookie, // Pulled securely from cookie context
            password: hashedPassword,
            phone, age, state, country,
            isVerified: true
        });

        // WHY: Clean up temp memory and remove the registration tracker cookie
        delete tempOtpStorage[emailFromCookie];
        res.clearCookie('user_email');

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}


// =========================================================================
// 4. LOGIN (Generate Token based on role: User vs Admin)
// =========================================================================
async function login(req, res) {
    console.log("login")
    try {
        console.log(req.body)
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // 🔑 Generate access token (expires in 1d) and refresh token (expires in 7d)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
            { expiresIn: '7d' }
        );

        // 🔒 Setting HTTP-Only cookies keeps authentication safe from XSS scripting attacks
        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        console.log("login Token :", token);

        // Send tokens back in JSON body as well for localStorage backup compatibility
        return res.status(200).json({
            message: "Login successful!",
            token: token,
            refreshToken: refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isOnboarded: user.isOnboarded,
                level: user.level,
                goal: user.goal,
                streak: user.streak,
                lastPracticeDate: user.lastPracticeDate
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}

// =========================================================================
// 4.1 GET PROFILE (Verify session and get user data)
// =========================================================================
async function getProfile(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. No session found.' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return a complete subset of user data for dashboard and settings panels
        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            isOnboarded: user.isOnboarded,
            level: user.level,
            goal: user.goal,
            streak: user.streak,
            phone: user.phone,
            age: user.age,
            state: user.state,
            country: user.country,
            settings: user.settings
        });
    } catch (err) {
        console.error("getProfile error:", err);
        return res.status(500).json({ error: 'Server error while fetching profile.' });
    }
}


// =========================================================================
// 5. FORGET PASSWORD (Generate OTP inside DB Document)
// =========================================================================
async function forgetPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ error: 'No account found with this email' });

        const otp = generateOtp();

        // WHY: Since the user already exists in MongoDB, we can now safely use the fields inside the User Schema
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOTPEmail(email, otp);

        // Set short-term cookie to track whose password is being reset
        res.cookie('reset_email', email, { httpOnly: true, maxAge: 10 * 60 * 1000, sameSite: 'lax' });

        return res.status(200).json({
            message: 'Password reset OTP sent to email!',
            otpExpiresAt: otpExpires // Send expiration timestamp to frontend
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}


async function verifyResetOtp(req, res) {
    try {
        const { otp } = req.body;
        const emailFromCookie = req.cookies.reset_email;

        if (!emailFromCookie) return res.status(400).json({ error: 'Session expired. Request OTP again.' });
        if (!otp) return res.status(400).json({ error: 'Please provide the OTP code' });

        const user = await userModel.findOne({ email: emailFromCookie });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if OTP is valid and not expired
        if (!user.otp || Date.now() > user.otpExpires) return res.status(400).json({ error: 'OTP expired.' });
        if (user.otp !== otp.trim()) return res.status(400).json({ error: 'Incorrect OTP code.' });

        // WHY: Instead of deleting the OTP, we keep it there but flag that it has been verified. 
        // This acts as a security clearance token for the final reset step.
        return res.status(200).json({ message: 'OTP verified successfully! You may now type your new password.' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}


// =========================================================================
// 6. RESET PASSWORD (Finalize structural password update)
// =========================================================================
async function resetPassword(req, res) {
    try {
        const { newPassword } = req.body; // Frontend ONLY sends the new password here
        const emailFromCookie = req.cookies.reset_email;

        if (!emailFromCookie) return res.status(400).json({ error: 'Reset session expired. Start over.' });
        if (!newPassword) return res.status(400).json({ error: 'New password is required' });

        const user = await userModel.findOne({ email: emailFromCookie });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // WHY: If user.otp is missing, it means they skipped Step 2 and tried to call this route directly!
        if (!user.otp) return res.status(401).json({ error: 'Unauthorized. You must verify the OTP first.' });

        // Save new hashed password
        user.password = await bcrypt.hash(newPassword, 10);

        // WHY: Wipe out the OTP fields completely so they can never be reused
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Clear tracking cookie
        res.clearCookie('reset_email');

        return res.status(200).json({ message: 'Password updated successfully! Go ahead and login.' });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

// =========================================================================
// 8. LOGOUT
// =========================================================================
async function logout(req, res) {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Logged out successfully' });
}

// =========================================================================
// 9. REFRESH TOKEN
// =========================================================================
async function refreshToken(req, res) {
    try {
        const refresh = req.cookies?.refresh_token;
        if (!refresh) return res.status(401).json({ error: 'Session expired. Please log in.' });

        const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        const user = await userModel.findById(decoded.id);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({ message: 'Token refreshed successfully', token });
    } catch (err) {
        console.error("Manual refresh token error:", err.message);
        return res.status(401).json({ error: 'Invalid or expired session. Please log in.' });
    }
}

module.exports = {
    OnlyEmail,
    verifyOtp,
    register,
    login,
    forgetPassword,
    verifyResetOtp,
    resetPassword,
    getProfile,
    refreshToken,
    logout
};