// 📄 Location: backend/models/Conversation.js
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String, // e.g., "Ordering food", "Salary negotiation"
        required: true
    },
    mode: {
        type: String, // freeTalk, rolePlay, debate, storyTelling, interview
        default: 'freeTalk'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    adaptiveMode: {
        type: Boolean,
        default: false
    },
    scenarioName: {
        type: String,
        default: ''
    },
    targetVocabulary: {
        type: [String],
        default: []
    },
    usedVocabulary: {
        type: [String],
        default: []
    },
    missionText: {
        type: String,
        default: ''
    },
    missionCompleted: {
        type: Boolean,
        default: false
    },
    messages: [
        {
            sender: { type: String, enum: ['user', 'ai'], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    overallScore: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number, // Saved in seconds
        default: 0
    },
    vocabularyUsed: {
        type: [String],
        default: []
    },
    grammarErrors: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);