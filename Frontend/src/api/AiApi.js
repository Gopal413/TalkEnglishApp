import axiosInstance from './axiosInstance';

// ==========================================
// CORRECTED DOCUMENTATION AI PIPELINE
// ==========================================

// 1. Trigger the session setup initialization row
export const startConversationApi = async (topic, mode, level, adaptiveMode, scenarioName, missionText, targetVocabulary) => {
    const response = await axiosInstance.post('/api/conversation/start', { 
        topic, 
        mode, 
        level, 
        adaptiveMode, 
        scenarioName, 
        missionText, 
        targetVocabulary 
    });
    return response.data; // Returns { conversationId }
};

// 2. Loop continuous text items securely back and forth
export const sendConversationMessageApi = async (conversationId, userText) => {
    const response = await axiosInstance.post('/api/conversation/message', { conversationId, userText });
    return response.data; // Returns { aiResponse }
};

// 3. Close conversation and grab performance metrics reports
export const endConversationApi = async (conversationId, duration) => {
    const response = await axiosInstance.post('/api/conversation/end', { conversationId, duration });
    return response.data; // Returns session analytics reports summary object
};

// Add this alongside your other axios API functions
export const checkGrammarApi = async (text, conversationId) => {
    // Passes the request directly through your secured axiosInstance configuration
    const response = await axiosInstance.post('/api/ai/grammar', { text, conversationId });
    return response.data; // Returns: { originalText, isValid, errors }
};
