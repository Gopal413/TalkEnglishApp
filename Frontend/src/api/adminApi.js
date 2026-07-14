import axiosInstance from './axiosInstance';

const BASE = '/admin';

// ==========================================
// DASHBOARD
// ==========================================
export const getAdminStats = async () => {
    const res = await axiosInstance.get(`${BASE}/stats`);
    return res.data;
};

// ==========================================
// USERS API (read-only)
// ==========================================
export const getAllUsersApi = async (params = {}) => {
    const res = await axiosInstance.get(`${BASE}/users`, { params });
    return res.data;
};

export const getUserByIdApi = async (id) => {
    const res = await axiosInstance.get(`${BASE}/users/${id}`);
    return res.data;
};

// ==========================================
// LESSONS API (Ownership checks in backend)
// ==========================================
export const getAllLessonsAdminApi = async (params = {}) => {
    const res = await axiosInstance.get(`${BASE}/lessons`, { params });
    return res.data;
};

export const getLessonAdminApi = async (id) => {
    const res = await axiosInstance.get(`${BASE}/lessons/${id}`);
    return res.data;
};

export const createLessonApi = async (data) => {
    const res = await axiosInstance.post(`${BASE}/lessons`, data);
    return res.data;
};

export const updateLessonApi = async (id, data) => {
    const res = await axiosInstance.put(`${BASE}/lessons/${id}`, data);
    return res.data;
};

export const deleteLessonApi = async (id) => {
    const res = await axiosInstance.delete(`${BASE}/lessons/${id}`);
    return res.data;
};

// ==========================================
// LEADERBOARD
// ==========================================
export const getLeaderboardApi = async () => {
    const res = await axiosInstance.get(`${BASE}/leaderboard`);
    return res.data;
};
