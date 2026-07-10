const express = require('express');
const router = express.Router();
const { getAllLessons, getLessonById, completeLesson } = require('../Controller/LessonController');

// GET  /lessons             → get all lessons with user's completion status
router.get('/', getAllLessons);

// GET  /lessons/:lessonId   → get one lesson's full content + quiz
router.get('/:lessonId', getLessonById);

// POST /lessons/:lessonId/complete → save quiz score for this lesson (one-time)
router.post('/:lessonId/complete', completeLesson);

module.exports = router;
