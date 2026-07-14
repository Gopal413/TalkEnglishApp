const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../Middleware/isSuperAdmin');

const {
    getDashboardStats,
    getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus,
    getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, promoteToAdmin, demoteAdmin, toggleAdminStatus,
    getAllLessonsAdmin, getLessonAdmin, createLesson, updateLesson, deleteLesson,
    getLeaderboard
} = require('../Controller/SuperAdminController');

// All routes in this file are protected by isSuperAdmin middleware
router.use(isSuperAdmin);

// ==========================================
// DASHBOARD
// ==========================================
router.get('/stats', getDashboardStats);

// ==========================================
// USERS CRUD
// ==========================================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', toggleUserStatus);

// ==========================================
// ADMINS CRUD
// ==========================================
router.get('/admins', getAllAdmins);
router.get('/admins/:id', getAdminById);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);
router.patch('/admins/:id/promote', promoteToAdmin);
router.patch('/admins/:id/demote', demoteAdmin);
router.patch('/admins/:id/status', toggleAdminStatus);

// ==========================================
// LESSONS CRUD
// ==========================================
router.get('/lessons', getAllLessonsAdmin);
router.get('/lessons/:id', getLessonAdmin);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// ==========================================
// LEADERBOARD (display only)
// ==========================================
router.get('/leaderboard', getLeaderboard);

module.exports = router;
