require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routes/UserRoutes');
const connectDB = require('./Config/dbConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend application URL
    credentials: true                // CRITICAL: Allows browser to pass cookies back and forth
}));
app.use(express.json()); // ✅ CRITICAL FIX: Allows your server to read req.body JSON strings
app.use(cookieParser());

// ==========================================
// ROUTES
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend! talkenglish' });
});

// ✅ CRITICAL FIX: Changed app.get to app.use so POST requests can pass through to your router
app.use("/auth", authRoutes); 

app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});
