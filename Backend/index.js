require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/dbConfig');

// Double-check the exact file system naming of your folders here!
const authRoutes = require('./Routes/AuthRoutes');
const userRoutes = require('./Routes/UserRoutes');
const conversationRoutes = require('./Routes/ConversationRoutes');
const isUserMiddleware = require('./Middleware/isUser');
const grammerRoutes = require('./Routes/GrammerRoutes');
const lessonRoutes = require('./Routes/LessonRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// ==========================================
// MIDDLEWARES (Keep this exact order)
// ==========================================
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true                
}));
app.use(express.json()); // Parsers MUST stay right here
app.use(cookieParser());

// ==========================================
// ROUTES
// ==========================================
app.use("/auth", authRoutes); 
app.use("/user", isUserMiddleware, userRoutes);

// 🚩 Ensure this matches your documentation endpoint layout precisely
app.use("/api/conversation", conversationRoutes); 
app.use("/api/ai",grammerRoutes);
app.use("/lessons", isUserMiddleware, lessonRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend! talkenglish' });
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});