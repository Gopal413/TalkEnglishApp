
//   level: {
//     type: String,
//     enum: ['beginner', 'intermediate', 'advanced'],
//     default: 'beginner',
//   },
//   goal: {
//     type: String,
//     enum: ['travel', 'business', 'casual'],
//     default: 'casual',
//   },
//   streak: {
//     type: Number,
//     default: 0,
//   },
//   lastPracticeDate: {
//     type: Date,
//     default: null,
//   },
//   settings: {
//     notifications: { type: Boolean, default: true },
//     darkMode: { type: Boolean, default: false },
//     nativeLanguage: { type: String, default: 'en' },
//     audioSpeed: { type: Number, default: 1, min: 0.5, max: 2 },
//   }


const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Will be hashed
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false }, // Flag to track verification
    otp: { type: String },                         // Temporary OTP storage
    otpExpires: { type: Date }                     // OTP expiration timestamp
},{timestamps:true});


const userModel = mongoose.model("users",UserSchema)
module.exports = userModel  