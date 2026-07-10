
// 📄 Location: backend/controllers/conversationController.js
const Conversation = require('../Models/ConversationModel');
const User = require('../Models/UserModel');
const axios = require('axios');

// =========================================================================
// 1. POST /api/conversation/start
// =========================================================================
async function startConversation(req, res) {
    try {
        // 🔐 Read user ID safely out of your verifyToken JWT middleware payload
        const userId = req.user ? req.user.id : null;
        const { topic, mode, level, adaptiveMode, scenarioName, missionText, targetVocabulary } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "A practice topic selection is required to start." });
        }

        // 🔍 Locate user to verify their current adaptive tier and settings
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User profile context not found." });
        }

        // 📈 If level was passed, update user profile dynamically so it syncs up
        if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
            user.level = level;
            await user.save();
        }

        // 🏗️ Spin up a fresh conversation row based on your DB schema rule specifications
        const newConversation = new Conversation({
            userId: user._id,
            topic: topic,
            scenarioName: scenarioName || '',
            mode: mode || 'freeTalk', 
            level: level || user.level || 'beginner',
            adaptiveMode: adaptiveMode || false,
            targetVocabulary: targetVocabulary || [],
            usedVocabulary: [],
            missionText: missionText || '',
            missionCompleted: false,
            messages: [],
            overallScore: 0,
            duration: 0,
            vocabularyUsed: [],
            grammarErrors: []
        });

        await newConversation.save();

        // ✉️ Send the new tracking ID and profile information back to the React app
        return res.status(201).json({ 
            message: "Conversation session initialized successfully.",
            conversationId: newConversation._id,
            topic: newConversation.topic,
            scenarioName: newConversation.scenarioName,
            mode: newConversation.mode,
            level: newConversation.level,
            adaptiveMode: newConversation.adaptiveMode,
            missionText: newConversation.missionText,
            targetVocabulary: newConversation.targetVocabulary,
            userLevel: user.level, // Pass level ('beginner', etc.) so frontend views can adapt instantly
            userGoal: user.goal    // Pass goal ('travel', etc.) for context matching
        });

    } catch (err) {
        console.error("Error inside startConversation controller:", err);
        return res.status(500).json({ error: "Failed to initialize conversational tutor session." });
    }
}
// =========================================================================
// 2. POST /api/conversation/message
// =========================================================================
// async function sendMessage(req, res) {
//     try {
//         const userId = req.user?.id; // Extracted safely from your isUserMiddleware token payload
//         const { conversationId, userText } = req.body;

//         // 1. Structural Validations
//         if (!conversationId || !userText) {
//             return res.status(400).json({ error: "Missing conversationId or user message text." });
//         }

//         // 2. Retrieve the active conversation session tracking row
//         const conversation = await Conversation.findById(conversationId);
//         if (!conversation) {
//             return res.status(404).json({ error: "Active English practice session not found." });
//         }

//         // 3. Look up the user's profile to grab their current level and goals settings
//         const user = await User.findById(userId);
//         const userLevel = user?.level || 'beginner'; // Fallback safely to beginner if profile is blank
//         const userGoal = user?.goal || 'casual';

//         // 4. Push the user's input phrase directly into your conversation schema array
//         conversation.messages.push({ sender: 'user', text: userText.trim() });

//         // 5. Construct the smart adaptive system instructions prompt

// const systemPrompt = `You are Luna, an encouraging, open-ended real-time AI English conversation tutor.
// Current User Profile: Level is ${userLevel.toUpperCase()}, learning path goal is ${userGoal.toUpperCase()}.
// Current Practice Context: Scenario is "${conversation.topic}", using communication style Mode: "${conversation.mode}".

// STRICT RESPONDING RULES:
// 1. If Mode is "freeTalk", IGNORE rigid scenarios. Talk about whatever the user wants to talk about naturally. If they ask a general question about learning English, answer it directly as an expert teacher!
// 2. Speak matching the user's level (${userLevel}). Use simple vocabulary if they are a beginner, or natural idiomatic business structures if advanced.
// 3. Keep your response short, warm, and highly engaging (MAXIMUM 2-3 sentences). 
// 4. Always end your response with ONE clear, friendly follow-up question that pushes the conversation forward naturally based on what the user just said.`;
//         // 6. Build out the sequential rolling chat message context logs array
//         const contextHistory = [
//             { role: 'system', content: systemPrompt },
//             ...conversation.messages.map(msg => ({
//                 role: msg.sender === 'user' ? 'user' : 'assistant',
//                 content: msg.text
//             }))
//         ];

//         // 7. Request completions handling directly from OpenRouter's free-weights routing path
//         const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
//             model: 'openrouter/free', // Congestion-proof auto-rotating free tier
//             messages: contextHistory,
//             max_tokens: 150
//         }, {
//             headers: { 
//                 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         // 8. Extract Luna's generated feedback text
//         const aiText = aiResponse.data.choices[0].message.content;

//         // 9. Save Luna's response securely straight into the history array block
//         conversation.messages.push({ sender: 'ai', text: aiText });
//         await conversation.save();

//         // 10. Loop back data cleanly to your React app view layer
//         return res.status(200).json({ 
//             aiResponse: aiText 
//         });

//     } catch (err) {
//         console.error("Error inside sendMessage controller:", err.message);
//         return res.status(500).json({ error: "AI communication failure. Please verify server environment keys." });
//     }
// }

async function sendMessage(req, res) {
    try {
        const userId = req.user?.id;
        const { conversationId, userText } = req.body;

        if (!conversationId || !userText) {
            return res.status(400).json({ error: "Missing conversationId or text." });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Session not found." });
        }

        const user = await User.findById(userId);
        const userLevel = user?.level || 'beginner';
        const userGoal = user?.goal || 'casual';

        // 1. Immediately log the user's message into our database history stack
        const cleanUserText = userText.trim();
        conversation.messages.push({ sender: 'user', text: cleanUserText });

        // 2. Perform vocabulary and mission tracking
        let usedVocabUpdated = [...(conversation.usedVocabulary || [])];
        if (conversation.targetVocabulary && conversation.targetVocabulary.length > 0) {
            const lowerText = cleanUserText.toLowerCase();
            conversation.targetVocabulary.forEach(word => {
                const cleanWord = word.trim().toLowerCase();
                // Check if word exists in text using regex word boundaries
                const wordRegex = new RegExp(`\\b${cleanWord}\\b`, 'i');
                if (wordRegex.test(lowerText) && !usedVocabUpdated.includes(cleanWord)) {
                    usedVocabUpdated.push(cleanWord);
                }
            });
            conversation.usedVocabulary = usedVocabUpdated;
            
            // Check if user completed the mission
            if (usedVocabUpdated.length === conversation.targetVocabulary.length) {
                conversation.missionCompleted = true;
            }
        }

        // 3. Adaptive Difficulty Engine
        let initialLevel = conversation.level || userLevel;
        let activeLevel = initialLevel;
        let levelChanged = false;

        if (conversation.adaptiveMode) {
            const wordCount = cleanUserText.split(/\s+/).filter(w => w.length > 0).length;
            const hasConjunctions = /\b(because|although|however|therefore|when|if|while|since|unless|before|after|so|but|and|or)\b/i.test(cleanUserText);
            
            if (activeLevel === 'beginner') {
                // If they write a long sentence with connectors, bump up to intermediate
                if (wordCount >= 8 && hasConjunctions) {
                    activeLevel = 'intermediate';
                    levelChanged = true;
                }
            } else if (activeLevel === 'intermediate') {
                // If they write a very complex/long sentence, bump up to advanced
                if (wordCount >= 14 && hasConjunctions) {
                    activeLevel = 'advanced';
                    levelChanged = true;
                } 
                // If they write very short replies, bump down to beginner
                else if (wordCount <= 3) {
                    activeLevel = 'beginner';
                    levelChanged = true;
                }
            } else if (activeLevel === 'advanced') {
                // If they struggle and write very short replies, bump down to intermediate
                if (wordCount <= 4) {
                    activeLevel = 'intermediate';
                    levelChanged = true;
                }
            }

            if (levelChanged) {
                conversation.level = activeLevel;
                if (user) {
                    user.level = activeLevel;
                    await user.save();
                }
            }
        }

        // 4. Set up English Trainer configuration persona
        const missionInstructions = conversation.missionText
            ? `The user's current scenario mission is: "${conversation.missionText}". Target words: ${conversation.targetVocabulary.join(', ')}. Help them complete the mission naturally.`
            : '';

        const systemPrompt = `You are Luna, an open-ended, real-time AI English conversation tutor.
The user is speaking at an ${activeLevel.toUpperCase()} level with a learning goal: ${userGoal.toUpperCase()}.
${missionInstructions}

CORE RULES:
1. Speak matching the user's level (${activeLevel.toUpperCase()}). 
   - For BEGINNER: Use extremely simple words, short sentences (under 10 words), and very clear grammar.
   - For INTERMEDIATE: Use natural everyday English, normal vocabulary, and slightly longer compound sentences.
   - For ADVANCED: Use rich vocabulary, standard idioms, and complex sentence structures to stretch their abilities.
2. If the user makes clear structural mistakes or asks if they are correct, act as a friendly, supportive teacher. Correct them politely, explain why, and then keep the chat moving.
3. Keep your response brief (2-3 sentences max) and always close with one clear, friendly follow-up question to keep them speaking.`;

        const contextHistory = [
            { role: 'system', content: systemPrompt },
            ...conversation.messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }))
        ];

        let aiText = "";

        try {
            // 5. Fetch response from OpenRouter using a stable free model
            const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'openrouter/free',
                messages: contextHistory,
                max_tokens: 150,
                temperature: 0.7
            }, {
                headers: { 
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 12000 // 12 seconds to ensure slow free models succeed
            });

            aiText = aiResponse.data?.choices?.[0]?.message?.content;
        } catch (apiError) {
            console.warn("⚠️ External AI Tier Congested. Processing text through local fallback layer instead:", apiError.response?.data || apiError.message);
        }

        // 6. Level-aware Fallback Interceptor
        if (!aiText) {
            const normalizedText = cleanUserText.toLowerCase();
            let baseReply = "";

            if (normalizedText.includes("college") || normalizedText.includes("colleges")) {
                baseReply = "A college is a place of higher learning where students study specific subjects after high school to earn degrees. Have you ever attended or planned to attend a college?";
            } else if (normalizedText.includes("learn") && normalizedText.includes("english")) {
                baseReply = "To learn English well, practicing small talks and listening to daily audio is key. What do you think is the most challenging part of English for you?";
            } else if (normalizedText.includes("nothing") || normalizedText.includes("nothning")) {
                baseReply = "That's perfectly fine! We all need relaxing days. What do you usually like to spend your time on when you are free?";
            } else if (normalizedText.includes("book") || normalizedText.includes("read")) {
                baseReply = "Reading books is a wonderful habit to expand vocabulary. What was the last thing you read?";
            } else if (normalizedText.includes("how") && normalizedText.includes("day")) {
                baseReply = "Everything is fine on my end, thank you for asking! What kind of weather do you have around you right now?";
            } else if (normalizedText.includes("right") || normalizedText.includes("correct") || normalizedText.includes("wrong")) {
                baseReply = "Don't stress over mistakes! Every mistake makes you a better speaker. Let's practice more. What is your absolute favorite hobby?";
            } else {
                // A rotating array of fallback starter topics so they never repeat sequentially
                const fallbackStarters = [
                    "I see! Tell me: if you could visit any country in the world tomorrow, which one would you choose?",
                    "That makes sense. Let's talk about hobbies. Do you prefer listening to music or watching sports?",
                    "I understand completely. What did you eat for your last meal today?",
                    "Awesome! English practice is all about persistence. What are your plans for the upcoming weekend?",
                    "Got it! Let's talk about movies. Have you seen any interesting films recently?"
                ];
                const index = conversation.messages.length % fallbackStarters.length;
                baseReply = fallbackStarters[index];
            }

            if (activeLevel === 'beginner') {
                // Keep beginner responses simple
                aiText = baseReply;
            } else if (activeLevel === 'intermediate') {
                aiText = `That is interesting! ${baseReply}`;
            } else { // Advanced
                aiText = `I completely comprehend that perspective. ${baseReply}`;
            }
        }

        // 7. Save response text and commit session updates
        conversation.messages.push({ sender: 'ai', text: aiText });
        await conversation.save();

        return res.status(200).json({ 
            aiResponse: aiText,
            levelChanged: levelChanged,
            currentLevel: activeLevel,
            usedVocabulary: conversation.usedVocabulary,
            missionCompleted: conversation.missionCompleted
        });

    } catch (err) {
        console.error("Fatal exception in message pipeline:", err);
        return res.status(200).json({ 
            aiResponse: "I understand! Let's keep talking and practice. What else would you like to share?",
            levelChanged: false,
            currentLevel: 'beginner',
            usedVocabulary: [],
            missionCompleted: false
        });
    }
}

// =========================================================================
// 3. POST /api/conversation/end
// =========================================================================
async function endConversation(req, res) {
    try {
        const { conversationId, duration } = req.body;

        if (!conversationId) {
            return res.status(400).json({ error: "Missing conversationId to close the session." });
        }

        // 1. Find the target conversation document
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Practice session not found." });
        }

        // 2. Map structural analytics data inputs
        if (duration) {
            conversation.duration = Number(duration); // Save practice time in seconds
        }

        // 3. Set structural evaluation placeholders before writing feature modules later
        conversation.overallScore = 80; // Baseline default accuracy percentage

        await conversation.save();

        // 4. Return the summary metrics block to display on your UI recap modal
        return res.status(200).json({
            message: "Conversation session closed and saved successfully.",
            summary: {
                topic: conversation.topic,
                mode: conversation.mode,
                duration: conversation.duration,
                overallScore: conversation.overallScore,
                totalMessagesExchange: conversation.messages.length
            }
        });

    } catch (err) {
        console.error("Error inside endConversation controller:", err.message);
        return res.status(500).json({ error: "Failed to process session wrap-up report." });
    }
}



// Update your module exports footprint cleanly at the bottom of the file
module.exports = { 
    startConversation, 
    sendMessage,
    endConversation, // 👈 ADD THIS LINE
   
};


// const Conversation = require('../models/Conversation');
// const User = require('../models/User');
// const axios = require('axios');

// // 1. POST /api/conversation/start
// async function startConversation(req, res) {
//     try {
//         const userId = req.user; 
//         const { topic, mode } = req.body; // Requirements from your DB Schema

//         const newConversation = new Conversation({
//             userId,
//             topic,
//             mode: mode || 'freeTalk',
//             messages: [],
//             overallScore: 0,
//             duration: 0
//         });

//         await newConversation.save();
//         return res.status(201).json({ conversationId: newConversation._id });
//     } catch (err) {
//         return res.status(500).json({ error: 'Failed to start conversation session.' });
//     }
// }

// // 2. POST /api/conversation/message
// async function sendMessage(req, res) {
//     try {
//         const userId = req.user;
//         const { conversationId, userText } = req.body;

//         const conversation = await Conversation.findById(conversationId);
//         if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

//         // Fetch user level to feed adaptive prompts dynamically
//         const foundUser = await User.findById(userId);
//         const userLevel = foundUser?.level || 'beginner';

//         conversation.messages.push({ sender: 'user', text: userText });

//         const systemPrompt = `You are an expert English tutor named Luna. 
//         Adaptive Level: ${userLevel}. Mode: ${conversation.mode}. Topic: "${conversation.topic}". 
//         Keep your response concise (under 3 sentences) and end with a natural question.`;

//         const contextHistory = [
//             { role: 'system', content: systemPrompt },
//             ...conversation.messages.map(msg => ({
//                 role: msg.sender === 'user' ? 'user' : 'assistant',
//                 content: msg.text
//             }))
//         ];

//         // Utilizing OpenRouter free route configuration securely
//         const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
//             model: 'openrouter/free',
//             messages: contextHistory,
//             max_tokens: 150
//         }, {
//             headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
//         });

//         const aiText = aiResponse.data.choices[0].message.content;
//         conversation.messages.push({ sender: 'ai', text: aiText });
//         await conversation.save();

//         return res.status(200).json({ aiResponse: aiText });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'AI processing failed.' });
//     }
// }

// // 3. POST /api/conversation/end
// async function endConversation(req, res) {
//     try {
//         const { conversationId, duration } = req.body;
//         const conversation = await Conversation.findById(conversationId);
//         if (!conversation) return res.status(404).json({ error: 'Session not found.' });

//         if (duration) conversation.duration = duration;
//         // Basic static placeholders before integrating Feature 2 & 4 calculations later
//         conversation.overallScore = 85; 
//         await conversation.save();

//         return res.status(200).json({ 
//             message: "Conversation ended successfully.",
//             summary: {
//                 topic: conversation.topic,
//                 duration: conversation.duration,
//                 overallScore: conversation.overallScore
//             }
//         });
//     } catch (err) {
//         return res.status(500).json({ error: 'Failed to wrap up session analytics.' });
//     }
// }

// module.exports = { startConversation, sendMessage, endConversation };


// const axios = require('axios');
// const User = require('../Models/userModel');
// const Conversation = require('../Models/ConversationModel');

// async function handleChatInteraction(req, res) {
//     try {
//         // if (!process.env.FREETHEAI_API_KEY) {
//         //     console.error("CRITICAL: FREETHEAI_API_KEY is not set in the environment variables.");
//         //     return res.status(500).json({ error: "AI service is not configured on the server." });
//         // }

//         const userId = req.user.id; // Appended by your token verification middleware
//         const { conversationId, topic, scenario, mode, userText, duration } = req.body;

//         // 1. Load user document profile context
//         const userProfile = await User.findById(userId);
//         if (!userProfile) {
//             return res.status(404).json({ error: 'User profile not found.' });
//         }
//         const userLevel = userProfile.level || 'beginner';

//         // 2. Build the System Instructions to enforce adaptive difficulty rules
//         const systemPrompt = `You are an expert English tutor named Luna. 
//         Have a conversation with the user about the topic: "${topic}" in a "${scenario}" scenario using "${mode || 'freeTalk'}" mode.
//         CRITICAL: The user's English level is "${userLevel}". 
//         Adjust your vocabulary size, sentence complexity, and speech patterns to perfectly match an English ${userLevel}. 
//         Keep your responses conversational, concise (under 3 sentences), and always end with a natural follow-up question to keep them speaking.`;

//         // 3. Look up existing historical documents or start a new collection entry
//         let conversation;
//         if (conversationId) {
//             conversation = await Conversation.findById(conversationId);
//         } else {
//             conversation = new Conversation({ 
//                 userId, 
//                 topic, 
//                 scenario, 
//                 mode: mode || 'freeTalk', 
//                 messages: [] 
//             });
//         }

//         // Add user statement text to database history array
//         conversation.messages.push({ sender: 'user', text: userText });

//         // 4. Formulate raw chat objects into standard role/content maps
//         const contextHistory = [
//             { role: 'system', content: systemPrompt },
//             ...conversation.messages.map(msg => ({
//                 role: msg.sender === 'user' ? 'user' : 'assistant',
//                 content: msg.text
//             }))
//         ];

//         // // 5. Connect to the OpenAI-Compatible FreeTheAi platform endpoint
//         // // Using low-latency general chat tracking identifiers (e.g. bbl/* format models)
//         // const aiResponse = await axios.post('https://api.freetheai.xyz/v1/chat/completions', {
//         //     model: 'bbl/llama-3-8b-instruct', 
//         //     messages: contextHistory,
//         //     max_tokens: 150
//         // }, {
//         //     headers: { 'Authorization': `Bearer ${process.env.FREETHEAI_API_KEY}` }
//         // });

//         // const aiText = aiResponse.data.choices[0].message.content;

//         // =========================================================================
// // =========================================================================
// // 5. CONNECT TO THE FREE OPENROUTER API (Updated 404 Free Model ID Fix)
// // =========================================================================
// const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
//     model: 'openrouter/free', // 👈 Fixed with correct free model tag!
//     messages: contextHistory,
//     max_tokens: 150
// }, {
//     headers: { 
//         'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         'Content-Type': 'application/json'
//     }
// });

// // Extract the response text
// const aiText = aiResponse.data.choices[0].message.content;

//         // Append AI reply to database logs
//         conversation.messages.push({ sender: 'ai', text: aiText });
        
//         if (duration) conversation.duration += duration;
//         await conversation.save();

//         // 6. Advance user practice timestamps to maintain active status
//         userProfile.lastPracticeDate = new Date();
//         await userProfile.save();

//         return res.status(200).json({
//             conversationId: conversation._id,
//             aiResponse: aiText
//         });

//     } catch (err) {
//         console.error("AI Completion Module Error:", err.message);
//         return res.status(500).json({ error: 'Failed to negotiate completion layers with AI tutor.' });
//     }
// }

// module.exports = { handleChatInteraction };