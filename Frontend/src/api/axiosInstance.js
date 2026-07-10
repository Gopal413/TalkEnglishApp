import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/',
    // 1. COOKIE ACCEPT: This forces the browser to send HTTP-Only cookies automatically
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// ==========================================
// REQUEST INTERCEPTOR: (Appends Bearer Token if found)
// ==========================================
axiosInstance.interceptors.request.use(
    (config) => {
        // 2. HEADER ACCEPT: Check if there is also a token in localStorage
        const localToken = localStorage.getItem('auth_token');

        if (localToken) {
            // If found, we append it to the Authorization headers
            config.headers.Authorization = `Bearer ${localToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==========================================
// RESPONSE INTERCEPTOR: Global Error Catching
// ==========================================
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // If either the cookie session OR the bearer token expires (401 Unauthorized)
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized.');
            localStorage.removeItem('auth_token'); // Clean up local storage just in case
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;