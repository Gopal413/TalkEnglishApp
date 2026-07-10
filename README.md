#  TalkEnglish - AI-Powered Language Learning Platform

<!-- Replace with an actual screenshot -->

**TalkEnglish** is a modern, full-stack web application designed to help users improve their English speaking and comprehension skills through interactive, AI-powered conversations and structured lessons. The platform features an adaptive AI tutor, gamified learning missions, real-time feedback, and comprehensive progress tracking.

---

## ✨ Core Features

*   **AI Conversation Partner (Luna):** Engage in open-ended conversations or role-play realistic scenarios with an AI tutor that adapts its language complexity to your skill level in real-time.
*   **Gamified Scenarios & Missions:** Practice real-world situations like ordering coffee, checking into a hotel, or handling a job interview. Complete missions by using target vocabulary.
*   **Structured Lessons:** A complete library of lessons covering grammar, vocabulary, and pronunciation. Each lesson includes explanations, examples, and a final quiz to test comprehension.
*   **Real-time Feedback:**
    *   **Grammar Coach:** Get instant, gentle corrections on your written text.
    *   **Pronunciation Coach:** Read sentences aloud and receive an accuracy score and feedback on mispronounced words.
*   **Voice & Text Interaction:** Practice by typing or speaking directly to the AI tutor using your microphone. The AI's responses can be read aloud with adjustable speed and choice of American or British accents.
*   **Comprehensive User Dashboard:** A central hub to track your learning journey, including your daily streak, total practice time, average scores, and unlocked vocabulary.
*   **Personalized Experience:** Onboarding flow allows users to set their initial skill level and learning goals (e.g., travel, business, casual), which tailors the AI's behavior.
*   **Full Authentication:** Secure user registration and login system using JWT and cookies.

---

## 🧠 AI Architecture

The core of TalkEnglish's interactive experience is its dynamic conversation engine. This system is designed to be both intelligent and modular, allowing for easy maintenance and upgrades.

### 1. Dynamic Prompt Engineering

The backend (`ConversationController.js`) constructs a detailed **system prompt** for every user message. This prompt acts as the AI's "director," providing it with crucial context to generate the perfect response:

*   **Persona:** The AI is instructed to act as "Luna," a friendly and encouraging English tutor.
*   **User Profile:** It receives the user's current `level` (Beginner, Intermediate, Advanced) and `goal` (Travel, Business, etc.).
*   **Session Context:** It knows the `topic` of the conversation and the `mode` (e.g., Free Talk, Scenario).
*   **Mission Details:** If in a mission, it gets the `missionText` and `targetVocabulary`.
*   **Core Rules:** Strict instructions on how to respond based on the user's level, keeping replies concise, and always asking a follow-up question to drive the conversation forward.

### 2. Adaptive Difficulty Engine

The `sendMessage` function includes a built-in engine that analyzes the user's input (e.g., sentence length, use of conjunctions). In `adaptiveMode`, it can automatically adjust the user's difficulty level up or down, ensuring the conversation remains challenging but not overwhelming. This change is persisted in the user's profile for future sessions.

### 3. Swappable AI Provider (via OpenRouter)

The application currently uses **OpenRouter** to handle requests. OpenRouter is an API gateway that routes requests to various Large Language Models (LLMs), including free and open-source options.

**This architecture makes the AI provider easily swappable.** Because the backend communicates using a standard OpenAI-compatible API format, you can switch to a different provider (like OpenAI, Groq, Anthropic, or a self-hosted model) by changing just two lines in `ConversationController.js`:

1.  The `axios` POST request URL.
2.  The `model` name string.

### 4. Robust Fallback System

If the primary AI service fails or is congested (a common issue with free tiers), the `sendMessage` controller has a built-in **fallback mechanism**. It generates a simple, context-aware reply from a predefined set of responses. This ensures the user experience is never completely interrupted, even if the external AI is down.

---

## 🛠️ Technology Stack

The project is a monorepo with a React frontend and a Node.js/Express backend.

### Frontend (`/Frontend`)

*   **Framework:** React (with Vite)
*   **UI Library:** Material-UI (MUI) for a modern and responsive component-based design.
*   **State Management:**
    *   Redux Toolkit for managing complex chat session state.
    *   React Context API for global authentication state.
*   **Routing:** React Router for client-side navigation.
*   **Web APIs:**
    *   `SpeechRecognition` for voice-to-text input.
    *   `SpeechSynthesis` for text-to-speech output.
*   **API Communication:** Axios for making HTTP requests to the backend.

### Backend (`/Backend`)

*   **Framework:** Node.js with Express.js for the REST API.
*   **Database:** MongoDB with Mongoose for data modeling and validation.
*   **Authentication:** JSON Web Tokens (JWT) stored in HTTP-only cookies for secure session management.
*   **AI Integration:** Communicates with the OpenRouter API to generate dynamic, context-aware conversational responses.
*   **Middleware:** `cors`, `cookie-parser`, and custom middleware (`isUser`) for route protection.

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

*   Node.js (v18 or newer)
*   npm or yarn
*   MongoDB (local instance or a cloud service like MongoDB Atlas)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd c:\MainProject\TalkEnglish\Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the `/Backend` root and add your environment variables.

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_strong_jwt_secret
    OPENROUTER_API_KEY=your_openrouter_api_key
    ```

4.  **Start the backend server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd c:\MainProject\TalkEnglish\Frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The React application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```
TalkEnglish/
├── Backend/
│   ├── Config/         # Database configuration
│   ├── Controller/     # Request handling logic (MVC-style)
│   ├── Middleware/     # Custom Express middleware (e.g., auth)
│   ├── Models/         # Mongoose schemas
│   ├── Routes/         # API route definitions
│   └── index.js        # Main server entry point
└── Frontend/
    ├── public/
    └── src/
        ├── api/          # Functions for backend communication
        ├── Components/   # Reusable UI components
        ├── context/      # React Context providers
        ├── Pages/        # Top-level page components
        ├── Redux/        # Redux Toolkit store, slices
        ├── App.jsx       # Main application component with routing
        └── main.jsx      # Application entry point
```