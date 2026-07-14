# TalkEnglish - AI-Powered Language Learning Platform

<p align="center">
  <em>Speak English confidently with Luna, your personal AI conversation partner.</em>
</p>

<p align="center">
  <!-- Placeholder for a GIF of the app in action -->
  <img src="https://via.placeholder.com/800x450.png?text=App+Screenshot+or+GIF+Here" alt="TalkEnglish Application Screenshot" width="800"/>
</p>

<p align="center">
    <img alt="React" src="https://img.shields.io/badge/React-18.2.0-blue?logo=react">
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18.x-green?logo=nodedotjs">
    <img alt="Express" src="https://img.shields.io/badge/Express-4.18.2-lightgrey?logo=express">
    <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4.4-green?logo=mongodb">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-4.4.5-purple?logo=vite">
</p>

**TalkEnglish** is a modern, full-stack web application designed to help users improve their English speaking and comprehension skills through interactive, AI-powered conversations. The platform features an adaptive AI tutor, gamified learning missions, real-time feedback, and comprehensive progress tracking.

---

## 📋 Table of Contents

- ✨ Core Features
- 🛠️ Technology Stack
- 🏛️ System Architecture
- 🚀 Getting Started
- 📂 Project Structure
- 🔐 API Endpoints
- 🤝 Contributing
- 📜 License

---

## ✨ Core Features

*   🤖 **AI Conversation Partner (Luna):** Engage in open-ended conversations or role-play realistic scenarios with an AI tutor that adapts its language complexity to your skill level in real-time.
*   🎯 **Gamified Scenarios & Missions:** Practice real-world situations like ordering coffee or handling a job interview. Complete missions by using target vocabulary.
*   📚 **Structured Lessons:** A complete library of lessons covering grammar, vocabulary, and pronunciation, each with a final quiz to test comprehension.
*   💡 **Real-time Feedback:**
    *   **Grammar Coach:** Get instant, gentle corrections on your written text.
    *   **Pronunciation Coach:** Read sentences aloud and receive an accuracy score and feedback on mispronounced words.
*   🗣️ **Voice & Text Interaction:** Practice by typing or speaking directly to the AI tutor. The AI's responses can be read aloud with adjustable speed and choice of American or British accents.
*   📊 **Comprehensive User Dashboard:** A central hub to track your learning journey, including your daily streak, total practice time, average scores, and unlocked vocabulary.
*   👤 **Personalized Experience:** An onboarding flow allows users to set their initial skill level and learning goals, which tailors the AI's behavior.
*   🔒 **Full Authentication:** Secure user registration and login system using JWT and HTTP-only cookies.

---

## 🛠️ Technology Stack

| Category         | Technology                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React, Vite, Redux Toolkit, Material-UI (MUI), Axios |
| **Backend**      | Node.js, Express.js, MongoDB, Mongoose, JWT |
| **AI Integration** | OpenRouter                                                                                                    |
| **Web APIs**     | `SpeechRecognition` (Voice-to-Text), `SpeechSynthesis` (Text-to-Speech)                                                                 |

---

## 🏛️ System Architecture

The application is a monorepo containing two main parts: a React single-page application (SPA) frontend and a Node.js/Express REST API backend.

### Frontend Architecture

The frontend is designed for a responsive, interactive, and stateful user experience.

*   **Component-Based Design:**
    *   **Pages (`/src/Pages`):** Top-level components corresponding to routes (e.g., `/dashboard`, `/chat`). They compose layouts from smaller components.
    *   **Reusable Components (`/src/Components`):** A library of presentational components (e.g., `ChatBubble`, `LessonCard`) to ensure a consistent UI.
*   **State Management Strategy:**
    *   **Redux Toolkit (`/src/Redux`):** Manages complex global state like chat session history and AI status.
    *   **React Context API (`/src/context`):** Handles simpler, less frequently updated global state like authentication status.
*   **API Communication Layer (`/src/api`):**
    *   A centralized Axios instance is configured with interceptors to handle API requests and JWT authentication automatically.
    *   Service files (e.g., `userApi.js`) separate data fetching logic from UI components, making the code cleaner and more maintainable.

### Backend Architecture

The backend follows a classic Model-View-Controller (MVC) pattern to organize logic and ensure separation of concerns.

*   **Models (`/src/Models`):** Mongoose schemas define the structure for data (e.g., `User`, `Conversation`), enforcing validation rules at the database level.
*   **Controllers (`/src/Controller`):** Contain the core business logic. They handle incoming requests from the routes, interact with the models, and send back responses.
*   **Routes (`/src/Routes`):** Define the API endpoints (e.g., `/api/users/login`) and map them to the appropriate controller functions.
*   **Middleware (`/src/Middleware`):** Functions that run between the request and the response. This includes authentication checks (`isUser`), error handling, and parsing request bodies. The JWT authentication middleware protects private routes by verifying the token sent in cookies.

### AI Architecture

The core of the interactive experience is a modular and intelligent conversation engine.

1.  **Dynamic Prompt Engineering:** The backend constructs a detailed **system prompt** for every user message, providing the AI with context like user profile, conversation topic, and core rules.
2.  **Adaptive Difficulty Engine:** The system analyzes user input to automatically adjust the AI's language complexity, ensuring the conversation remains engaging.
3.  **Swappable AI Provider:** By using OpenRouter and a standard API format, the underlying Large Language Model (LLM) can be swapped with minimal code changes (e.g., to OpenAI, Groq, or a self-hosted model).
4.  **Robust Fallback System:** If the primary AI service fails, a built-in fallback mechanism generates a simple, context-aware reply, preventing service interruption.

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or newer)
*   `npm` or `yarn`
*   MongoDB (local instance or a cloud service like MongoDB Atlas)

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd c:\MainProject\TalkEnglish\Backend

# Install dependencies
npm install

# Create a .env file. You can copy .env.example if it exists.
touch .env
```

Add the following environment variables to your `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

```bash
# Start the backend server
npm start
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd c:\MainProject\TalkEnglish\Frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The backend will be running on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## 📂 Project Structure

```
TalkEnglish/
├── Backend/
│   ├── Config/         # Database configuration (db.js)
│   ├── Controller/     # Business logic (userController.js, etc.)
│   ├── Middleware/     # Express middleware (authMiddleware.js)
│   ├── Models/         # Mongoose schemas (userModel.js, etc.)
│   ├── Routes/         # API route definitions (userRoutes.js)
│   └── index.js        # Main server entry point
└── Frontend/
    ├── public/         # Static assets
    └── src/
        ├── api/          # Centralized API functions (axios instance)
        ├── Components/   # Reusable UI components (ChatBubble.jsx)
        ├── context/      # React Context providers (AuthContext.jsx)
        ├── Pages/        # Top-level page components (Dashboard.jsx)
        ├── Redux/        # Redux Toolkit store and slices (chatSlice.js)
        ├── App.jsx       # Main application component with routing
        └── main.jsx      # Application entry point
```

---

## 🔐 API Endpoints

All API routes are prefixed with `/api`.

| Method | Endpoint                | Protection | Description                               |
| :----- | :---------------------- | :--------- | :---------------------------------------- |
| `POST` | `/users/register`       | Public     | Register a new user.                      |
| `POST` | `/users/login`          | Public     | Log in a user and return a JWT in a cookie. |
| `POST` | `/users/logout`         | Public     | Clear the user's session cookie.          |
| `GET`  | `/users/profile`        | Private    | Get the current logged-in user's profile. |
| `PUT`  | `/users/profile`        | Private    | Update the user's profile information.    |
| `POST` | `/conversation/message` | Private    | Send a message to the AI and get a reply. |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information.