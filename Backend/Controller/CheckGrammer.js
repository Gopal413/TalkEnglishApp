const axios = require('axios');
const Conversation = require('../Models/ConversationModel');



// =========================================================================
// 1. POST /api/ai/grammar
// =========================================================================
async function checkGrammar(req, res) {
    try {
        const { text, conversationId } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required for grammar analysis." });
        }

        // 🌐 Call the Free open-source LanguageTool API
        const params = new URLSearchParams();
        params.append('text', text);
        params.append('language', 'en-US');

        const response = await axios.post('https://api.languagetool.org/v2/check', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 6000
        });

        // 🧠 Filter the complex response to only send what our frontend needs
        const errors = response.data.matches.map(match => ({
            message: match.message,                     // e.g., "Possible spelling mistake"
            uncleanText: match.context.text.substring(  // The specific bad phrase
                match.context.offset, 
                match.context.offset + match.context.length
            ),
            replacements: match.replacements.map(rep => rep.value).slice(0, 3) // Top 3 fix suggestions
        }));

        // 💾 If a conversationId is active, update the database tracking arrays automatically
        if (conversationId && errors.length > 0) {
            const currentMistakes = errors.map(e => e.uncleanText);
            await Conversation.findByIdAndUpdate(conversationId, {
                $push: { grammarErrors: { $each: currentMistakes } }
            });
        }

        return res.status(200).json({
            originalText: text,
            isValid: errors.length === 0,
            errorsCount: errors.length,
            errors: errors
        });

    } catch (err) {
        console.error("Grammar analysis service error:", err.message);
        // Fallback safely if external server is slow so the chat never breaks
        return res.status(200).json({
            originalText: text,
            isValid: true,
            errorsCount: 0,
            errors: []
        });
    }
}

module.exports = {
    checkGrammar
};