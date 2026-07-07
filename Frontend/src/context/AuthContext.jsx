import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

// 1. Create the Context Box
const AuthContext = createContext(null);

// 2. Build the Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);          // Holds user metadata: { id, name, email, role }
    const [loading, setLoading] = useState(true);     // Blocks rendering while checking active session
    const [error, setError] = useState(null);

    // ==========================================
    // 🔍 AUTOMATIC SESSION RECOVERY (ON REFRESH)
    // ==========================================
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Hits a protected endpoint (e.g., /auth/me or /auth/dashboard)
                // Since withCredentials: true is active, cookies are automatically attached
                const response = await axiosInstance.get('/dashboard'); 
                if (response.data?.user) {
                    setUser(response.data.user); // Re-authenticate user state seamlessly
                }
            } catch (err) {
                console.log("No active or valid session cookie found.");
                setUser(null);
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
    };

    // Logout handler that clears local state and handles backend cleanup
    const logout = async () => {
        try {
            // Optional: Call backend to clear HTTP-Only cookie explicitly
            // await axiosInstance.post('/logout'); 
            setUser(null);
            localStorage.removeItem('auth_token'); // Clean up token if using dual-accept model
            window.location.href = '/login';
        } catch (err) {
            console.error("Logout error", err);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, 
            isAdmin: user?.role === 'admin',
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