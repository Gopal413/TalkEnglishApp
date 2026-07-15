const jwt = require('jsonwebtoken');

// =========================================================================
// ADMIN GUARD MIDDLEWARE
// Verifies JWT + checks role is 'admin' or 'superadmin'. Includes transparent refresh.
// =========================================================================
const isAdminMiddleware = (req, res, next) => {
    let token = null;

    // 1. Check cookie first
    if (req.cookies && req.cookies.auth_token) {
        token = req.cookies.auth_token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    const checkRole = (payload) => {
        if (payload.role !== 'admin' && payload.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = payload;
        return next();
    };

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            return checkRole(decoded);
        } catch (error) {
            console.log('Admin: Access token expired, attempting refresh...');
        }
    }

    // 3. Transparent refresh via refresh_token cookie
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Access denied. Please log in.' });
    }

    try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');

        const newAccessToken = jwt.sign(
            { id: decodedRefresh.id, role: decodedRefresh.role || 'user' },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.cookie('auth_token', newAccessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        const payload = { id: decodedRefresh.id, role: decodedRefresh.role || 'user' };
        return checkRole(payload);
    } catch (refreshError) {
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};

module.exports = isAdminMiddleware;
