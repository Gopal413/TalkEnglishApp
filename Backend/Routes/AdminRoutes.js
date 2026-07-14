const express = require('express');
const router = express.Router();
const isAdmin = require('../Middleware/isAdmin');

const {
    getDashboardStats,
    getAllUsers, 
    getUserById,
    getAllLessonsAdmin, 
    getLessonAdmin, 
    createLesson, 
    updateLesson, 
    deleteLesson,
    getLeaderboard
} = require('../Controller/AdminController');

// All routes in this file are protected by isAdmin middleware
router.use(isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users (read-only)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

// Lessons CRUD (Ownership enforced inside controller)
router.get('/lessons', getAllLessonsAdmin);
router.get('/lessons/:id', getLessonAdmin);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Leaderboard (display-only)
router.get('/leaderboard', getLeaderboard);

module.exports = router;
