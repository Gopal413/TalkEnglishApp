const rateLimit = require('express-rate-limit');

// Global Rate Limiter: Applied to all requests
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

// Auth Rate Limiter: Applied to sensitive login and register routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 auth requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login or registration attempts. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

// OTP Rate Limiter: Applied to OTP send/resend endpoints
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again after 15 minutes.'
    },
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    otpLimiter
};
