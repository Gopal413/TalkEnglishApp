const express = require('express');
const router = express.Router();
const { completeOnboarding, getProgressStats, updateUserSettings, translateText } = require('../Controller/UserController');
const { getProfile } = require('../Controller/AuthController');


// Protected route: Save first-time categories data permanently
router.put('/onboarding', completeOnboarding);

// Protected route: Get the currently logged-in user's profile
router.get('/profile', getProfile);

// Protected route: Fetch calculated progress indicators
router.get('/progress', getProgressStats);

// Protected route: Update fluency configurations
router.put('/settings', updateUserSettings);

// Protected route: AI translation helper
router.post('/translate', translateText);

module.exports = router;