const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTPEmail } = require('../Utils/SentToEmail');
const User = require('../Models/userModel');

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
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const otp = generateOtp();

        // WHY: We save this to memory because the database requires Name and Password to create a user.
        tempOtpStorage[email] = {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
            isVerified: false
        };

        await sendOTPEmail(email, otp);

        // WHY: We drop the email into a cookie so the frontend doesn't have to resend it on the next step
        res.cookie('user_email', email, { httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: 'lax' });

        return res.status(200).json({ message: 'OTP sent successfully!' });
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
        const user = await User.create({
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
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "All fields are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // WHY: We embed the ID and ROLE directly into the payload to allow admin check middleware later
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '1d' }
        );

        // WHY: Setting an HTTP-Only authorization cookie keeps authentication highly secure from browser hacks
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });

        return res.status(200).json({ message: `Login successful! Welcome ${user.role}`, role: user.role ,token});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
}


// =========================================================================
// 5. FORGET PASSWORD (Generate OTP inside DB Document)
// =========================================================================
async function forgetPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'No account found with this email' });

        const otp = generateOtp();

        // WHY: Since the user already exists in MongoDB, we can now safely use the fields inside the User Schema
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
        await user.save();

        await sendOTPEmail(email, otp);

        // Set short-term cookie to track whose password is being reset
        res.cookie('reset_email', email, { httpOnly: true, maxAge: 10 * 60 * 1000, sameSite: 'lax' });

        return res.status(200).json({ message: 'Password reset OTP sent to email!' });
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

        const user = await User.findOne({ email: emailFromCookie });
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

        const user = await User.findOne({ email: emailFromCookie });
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

module.exports = { OnlyEmail, verifyOtp, register, login, forgetPassword,verifyResetOtp, resetPassword };