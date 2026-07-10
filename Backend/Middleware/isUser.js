const jwt = require('jsonwebtoken');

const isUserMiddleware = (req, res, next) => {
    let token = null;

    // 1. Check if access token is in the cookies
    if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    } 
    // 2. Check if access token is in the Authorization Header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Verify access token
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.user = decoded; 
            return next();
        } catch (error) {
            console.log("Access token expired or invalid, attempting refresh...");
            // Access token is invalid/expired. Let's try transparently refreshing it.
        }
    }

    // 3. Transparent Refresh: Check if refresh token cookie is present
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    try {
        // Verify the refresh token
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
        
        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: decodedRefresh.id, role: decodedRefresh.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        // Set the new access token cookie
        res.cookie('auth_token', newAccessToken, { 
            httpOnly: true, 
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        // Set req.user and call next
        req.user = { id: decodedRefresh.id, role: decodedRefresh.role || 'user' };
        return next();
    } catch (refreshError) {
        console.error("Refresh token verification failed:", refreshError.message);
        // Clear cookies to avoid infinite redirect loops
        res.clearCookie('auth_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};

module.exports = isUserMiddleware;