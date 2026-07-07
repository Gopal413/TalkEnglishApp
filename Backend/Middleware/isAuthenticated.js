const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    let token = null;

    // 1. Check if token is in the cookies
    if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    } 
    // 2. Check if token is in the Authorization Header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Splits "Bearer TOKEN_STRING" to get the token
    }

    // If neither has the token, block the user
    if (!token) {
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    try {
        // Verify the token (works perfectly no matter how the token arrived)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded; 
        next(); 
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = isAuthenticated;