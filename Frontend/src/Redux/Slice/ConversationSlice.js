import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",
  initialState: {
    messages: [],          
  conversationId: null,  
  isLoading: false,      
  sessionSummary: null,  
  latestErrors: [],
  // 🎙️ ADD THESE FOR PRONUNCIATION COACH:
  targetSentence: "The quick brown fox jumps over the lazy dog.", // Default text to practice
  pronunciationScore: null,
  mispronouncedWords: [] // Holds performance tracking data when the user exits
  },
  reducers: {
    setSessionStart: (state, action) => {
      state.conversationId = action.payload.conversationId;
      state.messages = [];
      state.sessionSummary = null;
      state.isLoading = false;
      state.latestErrors = []; // Reset on start
    },
    addUserMessage: (state, action) => {
      state.messages.push({ sender: 'user', text: action.payload });
      state.isLoading = true;
      state.latestErrors = []; // Clear old errors when typing a new sentence
    },
    addAiResponse: (state, action) => {
      state.messages.push({ sender: 'ai', text: action.payload });
      state.isLoading = false;
    },
    // 👈 ADD THIS: Updates the UI with current grammatical mistakes found
    setLatestGrammarErrors: (state, action) => {
      state.latestErrors = action.payload;
    },
    setSessionEnd: (state, action) => {
      state.sessionSummary = action.payload;
      state.conversationId = null; 
      state.isLoading = false;
      state.latestErrors = [];
    },
    resetChatState: (state) => {
     state.messages = [];
    state.conversationId = null;
    state.isLoading = false;
    state.sessionSummary = null;
    state.latestErrors = [];
    state.pronunciationScore = null;
    state.mispronouncedWords = [];
    },
    setPronunciationResult: (state, action) => {
      state.pronunciationScore = action.payload.score;
      state.mispronouncedWords = action.payload.mispronouncedWords;
    },
    setTargetSentence: (state, action) => {
      state.targetSentence = action.payload;
      state.pronunciationScore = null;
      state.mispronouncedWords = [];
    }
  }
});

export const { 
  setSessionStart, 
  addUserMessage, 
  addAiResponse, 
  setSessionEnd, 
  resetChatState,
  setLatestGrammarErrors,
  setPronunciationResult,
  setTargetSentence
} = conversationSlice.actions;

export default conversationSlice.reducer;