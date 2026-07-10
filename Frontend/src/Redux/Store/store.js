import { configureStore } from '@reduxjs/toolkit';
import conversationReducer from '../Slice/ConversationSlice';

// This is the central Redux store for your application.
// It combines all the different "slices" of your state into one place.
export const store = configureStore({
  reducer: {
    // The 'conversation' key here is important. It's how you'll access
    // this slice's state in your components (e.g., state.conversation)
    conversation: conversationReducer,
  },
});