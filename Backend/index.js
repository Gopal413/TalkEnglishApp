require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { globalLimiter, authLimiter, otpLimiter } = require('./Middleware/rateLimiter');
const connectDB = require('./Config/dbConfig');

// Double-check the exact file system naming of your folders here!
const authRoutes = require('./Routes/AuthRoutes');
const userRoutes = require('./Routes/UserRoutes');
const conversationRoutes = require('./Routes/ConversationRoutes');
const isUserMiddleware = require('./Middleware/isUser');
const grammerRoutes = require('./Routes/GrammerRoutes');
const lessonRoutes = require('./Routes/LessonRoutes');
const superAdminRoutes = require('./Routes/SuperAdminRoutes');
const adminRoutes = require('./Routes/AdminRoutes');
const { autoSeedAccounts } = require('./Utils/autoSeed');
const { seedSuperAdmin } = require('./Controller/SuperAdminController');


const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
    autoSeedAccounts();
});

// ==========================================
// MIDDLEWARES (Keep this exact order)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'https://talk-english-app-two.vercel.app',
        'https://talkenglishapp.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176'
    ];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, origin); // Pass origin string instead of true
        }
        return callback(new Error('CORS Policy: Origin not allowed'), false);
    },
    credentials: true                
}));
app.use(express.json()); // Parsers MUST stay right here
app.use(cookieParser());
app.use(helmet());
app.use(globalLimiter);

// ==========================================
// ROUTES & RATE LIMITERS FOR SENSITIVE ENDPOINTS
// ==========================================
app.use('/auth/register/send-otp', otpLimiter);
app.use('/auth/login/resend-otp', otpLimiter);
app.use('/auth/password/forget', otpLimiter);

app.use('/auth/login', authLimiter);
app.use('/auth/register/complete', authLimiter);
app.use('/auth/password/reset', authLimiter);

app.use("/auth", authRoutes); 
app.use("/user", isUserMiddleware, userRoutes);

// 🚩 Ensure this matches your documentation endpoint layout precisely
app.use("/api/conversation", conversationRoutes); 
app.use("/api/ai",grammerRoutes);
app.use("/lessons", isUserMiddleware, lessonRoutes);

// ==========================================
// ADMIN & SUPERADMIN ROUTES
// ==========================================
app.use("/superadmin", superAdminRoutes);  // Protected by isSuperAdmin middleware internally
app.use("/admin", adminRoutes);            // Protected by isAdmin middleware internally
app.post("/auth/admin/seed", seedSuperAdmin); // One-time seed route (disabled in production)

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend! talkenglish' });
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});