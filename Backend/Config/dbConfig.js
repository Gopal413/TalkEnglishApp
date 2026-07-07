const mongoose = require('mongoose');

// WHY: We wrap this in an async function because connecting to a database takes time (a promise)
const connectDB = async () => {
    try {
        // 1. Attempt connection using the hidden .env variable
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // 2. Log success message if it works
        console.log(`MongoDB Connected Safely`);
    } catch (error) {
        // 3. Handle errors if the database fails to connect
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1); // Stop the entire server immediately if DB connection fails
    }
};

module.exports = connectDB;