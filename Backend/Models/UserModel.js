
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // ==========================================
    // 🔐 SECTION A: AUTHENTICATION & BASIC CORE INFO
    // ==========================================
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    state: { 
        type: String, 
        required: true 
    },
    country: { 
        type: String, 
        required: true 
    },
    
    // ==========================================
    // 🔑 ROLE-BASED ACCESS CONTROL
    // ==========================================
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true  // false = account disabled (cannot login)
    },

    // OTP Handshake Flags
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    otp: { 
        type: String, 
        default: null 
    },
    otpExpires: { 
        type: Date, 
        default: null 
    },

    // ==========================================
    // 🚩 THE GATEKEEPER SWITCH
    // ==========================================
    isOnboarded: { 
        type: Boolean, 
        default: false // Starts false. Turns true AFTER they complete the questionnaire.
    },

    // ==========================================
    // 📈 SECTION B: ENGLISH PROGRESSION & APP STATES
    // ==========================================
    level: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced'], 
        default: null // Null until they complete onboarding
    },
    goal: { 
        type: String, 
        enum: ['travel', 'business', 'casual'], 
        default: null // Null until they complete onboarding
    },
    streak: { 
        type: Number, 
        default: 0 
    },
    lastPracticeDate: { 
        type: Date, 
        default: null 
    },
    settings: {
        dailyReminder: { type: Boolean, default: true },
        theme: { type: String, default: 'light' },
        nativeLanguage: { type: String, default: 'en' }
    },

    // ==========================================
    // 📚 SECTION C: LESSON PROGRESS TRACKING
    // ==========================================
    completedLessons: [{
        lessonId: { type: String, required: true },
        score: { type: Number, required: true },      // e.g. 4
        total: { type: Number, required: true },      // e.g. 5
        percentage: { type: Number, required: true }, // e.g. 80
        completedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const userModel = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = userModel;
