const mongoose = require('mongoose');

// =========================================================================
// LESSON MODEL — Stores lesson metadata + content + quiz questions
// =========================================================================
const QuizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],    // Array of 4 choices
    correctIndex: { type: Number, required: true }   // Index of the correct option
}, { _id: false });

const LessonStepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    explanation: { type: String, required: true },
    example: { type: String, required: true },       // Example sentence
    tip: { type: String, default: null }             // Optional grammar/usage tip
}, { _id: false });

const LessonSchema = new mongoose.Schema({
    lessonId: { type: String, required: true, unique: true }, // e.g. "lesson_001"
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['grammar', 'vocabulary', 'pronunciation', 'phrases'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    description: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 5 },
    emoji: { type: String, default: '📖' },
    // unlockAfter: minimum beginner completions required (0 = always unlocked)
    unlockAfter: { type: Number, default: 0 },
    steps: [LessonStepSchema],
    quiz: [QuizQuestionSchema],
    // Track which admin created this lesson
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdByName: { type: String, default: 'System' }
}, { timestamps: true });

const LessonModel = mongoose.model('lessons', LessonSchema);
module.exports = LessonModel;
