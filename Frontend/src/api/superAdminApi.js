import axiosInstance from './axiosInstance';

const BASE = '/superadmin';

// ==========================================
// DASHBOARD
// ==========================================
export const getSuperAdminStats = async () => {
    const res = await axiosInstance.get(`${BASE}/stats`);
    return res.data;
};

// ==========================================
// USERS API
// ==========================================
export const getAllUsersApi = async (params = {}) => {
    const res = await axiosInstance.get(`${BASE}/users`, { params });
    return res.data;
};

export const getUserByIdApi = async (id) => {
    const res = await axiosInstance.get(`${BASE}/users/${id}`);
    return res.data;
};

export const createUserApi = async (data) => {
    const res = await axiosInstance.post(`${BASE}/users`, data);
    return res.data;
};

export const updateUserApi = async (id, data) => {
    const res = await axiosInstance.put(`${BASE}/users/${id}`, data);
    return res.data;
};

export const deleteUserApi = async (id) => {
    const res = await axiosInstance.delete(`${BASE}/users/${id}`);
    return res.data;
};

export const toggleUserStatusApi = async (id) => {
    const res = await axiosInstance.patch(`${BASE}/users/${id}/status`);
    return res.data;
};

// ==========================================
// ADMINS API
// ==========================================
export const getAllAdminsApi = async (params = {}) => {
    const res = await axiosInstance.get(`${BASE}/admins`, { params });
    return res.data;
};

export const getAdminByIdApi = async (id) => {
    const res = await axiosInstance.get(`${BASE}/admins/${id}`);
    return res.data;
};

export const createAdminApi = async (data) => {
    const res = await axiosInstance.post(`${BASE}/admins`, data);
    return res.data;
};

export const updateAdminApi = async (id, data) => {
    const res = await axiosInstance.put(`${BASE}/admins/${id}`, data);
    return res.data;
};

export const deleteAdminApi = async (id) => {
    const res = await axiosInstance.delete(`${BASE}/admins/${id}`);
    return res.data;
};

export const promoteToAdminApi = async (id) => {
    const res = await axiosInstance.patch(`${BASE}/admins/${id}/promote`);
    return res.data;
};

export const demoteAdminApi = async (id) => {
    const res = await axiosInstance.patch(`${BASE}/admins/${id}/demote`);
    return res.data;
};

export const toggleAdminStatusApi = async (id) => {
    const res = await axiosInstance.patch(`${BASE}/admins/${id}/status`);
    return res.data;
};

// ==========================================
// LESSONS API
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
