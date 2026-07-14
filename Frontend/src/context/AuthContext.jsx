import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Create the Context Box
const AuthContext = createContext(null);

// 2. Build the Provider Component
export function AuthProvider({ children }) {
    // Synchronously recover session on initial mount to prevent route guarding flashes
    const [user, setUser] = useState(() => {
        const cached = localStorage.getItem('user_profile');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);     // Blocks rendering while checking active session
    const [error, setError] = useState(null);

    // ==========================================
    // 🔍 AUTOMATIC SESSION RECOVERY (ON REFRESH)
    // ==========================================
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Since withCredentials: true is active, cookies are automatically attached
                const response = await axiosInstance.get('/user/profile'); 
                if (response.data && response.data.id) {
                    setUser(response.data); // Re-authenticate user state seamlessly
                    localStorage.setItem('user_profile', JSON.stringify(response.data));
                }
            } catch (err) {
                console.log("No active or valid session cookie found.");
                setUser(null);
                localStorage.removeItem('user_profile');
            } finally {
                setLoading(false); // Stop loading fallback view screen
            }
        };
        checkSession();
    }, []);

    // ==========================================
    // 🔑 CONTEXT AUTHENTICATION ACTIONS
    // ==========================================
    
    // Login handler called directly by Login.jsx form
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user_profile', JSON.stringify(userData));
    };

    // Logout handler that clears local state and handles backend cleanup
    const logout = async () => {
        try {
            // Call backend to clear HTTP-Only cookies
            await axiosInstance.post('/auth/logout'); 
            setUser(null);
            localStorage.removeItem('user_profile');
            localStorage.removeItem('auth_token'); // Clean up tokens if using dual-accept model
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        } catch (err) {
            console.error("Logout error", err);
            // Fallback clear state even if API fails
            setUser(null);
            localStorage.removeItem('user_profile');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
            isSuperAdmin: user?.role === 'superadmin',
            loading, 
            error,
            login, 
            logout 
        }}>
            {/* Prevent app from loading components prematurely before session verification finishes */}
            {!loading && children}
        </AuthContext.Provider>
    );
}

// 3. Custom Hook Shortcut for cleaner page imports
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be utilized strictly within an AuthProvider wrapper");
    }
    return context;
};