const User = require('../Models/UserModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// =========================================================================
// 2. ONE-TIME ONBOARDING QUESTIONNAIRE STORAGE HANDLER
// =========================================================================
async function completeOnboarding(req, res) {
    try {
        const { level, goal, dailyReminder } = req.body;
        const userId = req.user.id; // Extracted safely out of the verifyToken JWT middleware payload

        // Validate basic user selections against allowed enum definitions
        if (!level || !goal) {
            return res.status(400).json({ error: "Please select both an English level and a practice goal." });
        }

        // Fetch user document from database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        // Fallback protection: If they are already onboarded, reject extra updates here
        if (user.isOnboarded) {
            return res.status(400).json({ error: "Onboarding questionnaire has already been completed." });
        }

        // Save categories parameters permanently into user record fields
        user.level = level;
        user.goal = goal;
        user.settings = {
            dailyReminder: dailyReminder !== undefined ? dailyReminder : true,
            theme: 'light'
        };

        // Initialize their practice history states
        user.streak = 1; // Give them day 1 streak point immediately
        user.lastPracticeDate = new Date(); // Log initial timestamp entry
        
        // 🚩 FLIP THE GATEKEEPER SWITCH PERMANENTLY
        user.isOnboarded = true; 

        await user.save();

        return res.status(200).json({ 
            message: "Onboarding choices saved permanently!", 
            user: {
                id: user._id,
                name: user.name,
                isOnboarded: user.isOnboarded,
                level: user.level,
                goal: user.goal,
                streak: user.streak,
                lastPracticeDate: user.lastPracticeDate
            }
        });

    } catch (err) {
        console.error("Onboarding Controller Error:", err);
        return res.status(500).json({ error: "Failed to process first-time registration choices." });
    }
}

// =========================================================================
// 1. GET PROFILE (Verify session and get user data)
// =========================================================================
async function getProfile(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. No session found.' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return a complete subset of user data for dashboard and settings panels
        return res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isOnboarded: user.isOnboarded,
            level: user.level,
            goal: user.goal,
            streak: user.streak,
            phone: user.phone,
            age: user.age,
            state: user.state,
            country: user.country,
            settings: user.settings
        });
    } catch (err) {
        console.error("getProfile error:", err);
        return res.status(500).json({ error: 'Server error while fetching profile.' });
    }
}

const Conversation = require('../Models/ConversationModel');

// =========================================================================
// 3. GET PROGRESS STATS AND ANALYTICS
// =========================================================================
async function getProgressStats(req, res) {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User context profile not found." });
        }

        // Find all conversations by this user
        const conversations = await Conversation.find({ userId: userId });

        let totalDuration = 0;
        let totalScore = 0;
        let completedMissions = 0;
        let uniqueVocabulary = new Set();

        conversations.forEach(c => {
            totalDuration += c.duration || 0;
            totalScore += c.overallScore || 0;
            if (c.missionCompleted) {
                completedMissions++;
            }
            if (c.usedVocabulary && c.usedVocabulary.length > 0) {
                c.usedVocabulary.forEach(v => uniqueVocabulary.add(v.toLowerCase()));
            }
        });

        const averageScore = conversations.length > 0 ? Math.round(totalScore / conversations.length) : 0;

        // Visual recommendations logic
        let recommendation = "Initiate your daily conversation practice!";
        if (user.level === 'beginner') {
            recommendation = "Try practicing the 'Ordering Coffee ☕' scenario at Beginner level.";
        } else if (user.level === 'intermediate') {
            recommendation = "Practice your check-in questions in the 'Airport Check-in ✈️' scenario.";
        } else {
            recommendation = "Step up to the watercooler water with 'Salary Negotiation 💰' at Advanced level.";
        }

        return res.status(200).json({
            streak: user.streak || 0,
            level: user.level || 'beginner',
            goal: user.goal || 'casual',
            totalConversations: conversations.length,
            totalDuration: totalDuration, // in seconds
            averageScore: averageScore,
            completedMissions: completedMissions,
            uniqueVocabulary: Array.from(uniqueVocabulary),
            recommendation: recommendation
        });

    } catch (err) {
        console.error("Get Progress Stats Error:", err);
        return res.status(500).json({ error: "Failed to load progress details." });
    }
}

// =========================================================================
// 4. UPDATE USER SETTINGS
// =========================================================================
async function updateUserSettings(req, res) {
    try {
        const userId = req.user.id;
        const { 
            level, 
            goal, 
            dailyReminder, 
            nativeLanguage,
            name,
            phone,
            age,
            state,
            country
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }

        if (level) user.level = level;
        if (goal) user.goal = goal;
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (age) user.age = Number(age);
        if (state) user.state = state;
        if (country) user.country = country;

        if (dailyReminder !== undefined || nativeLanguage !== undefined) {
            user.settings = {
                ...user.settings,
                dailyReminder: dailyReminder !== undefined ? dailyReminder : user.settings.dailyReminder,
                nativeLanguage: nativeLanguage !== undefined ? nativeLanguage : user.settings.nativeLanguage
            };
        }

        await user.save();

        return res.status(200).json({
            message: "Settings updated successfully",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                isOnboarded: user.isOnboarded,
                level: user.level,
                goal: user.goal,
                streak: user.streak,
                phone: user.phone,
                age: user.age,
                state: user.state,
                country: user.country,
                settings: user.settings
            }
        });

    } catch (err) {
        console.error("Update User Settings Error:", err);
        return res.status(500).json({ error: "Failed to update settings parameters." });
    }
}

// =========================================================================
// 5. TRANSLATION AI SERVICE (Using free OpenRouter model)
// =========================================================================
async function translateText(req, res) {
    try {
        const { text, targetLanguage } = req.body;
        if (!text || !targetLanguage) {
            return res.status(400).json({ error: "Text and targetLanguage are required." });
        }

        if (targetLanguage === 'en') {
            return res.status(200).json({ translation: text });
        }

        const langNameMap = {
            'es': 'Spanish',
            'hi': 'Hindi',
            'fr': 'French',
            'de': 'German',
            'zh': 'Chinese',
            'ja': 'Japanese'
        };
        const mappedLang = langNameMap[targetLanguage] || targetLanguage;

        const systemPrompt = `You are a helpful language translation assistant. Translate the following English sentence to ${mappedLang}. Only respond with the translated text. Do not provide any introduction, explanation, quotes, or conversational phrases.`;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openrouter/free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            max_tokens: 150,
            temperature: 0.3
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });

        const translation = response.data?.choices?.[0]?.message?.content || "Translation temporarily unavailable.";
        return res.status(200).json({ translation: translation.trim() });
    } catch (err) {
        console.error("Translation helper error:", err.message);
        return res.status(200).json({ translation: "Translation service offline." });
    }
}

module.exports = { 
    completeOnboarding, 
    getProfile,
    getProgressStats, 
    updateUserSettings,
    translateText
};