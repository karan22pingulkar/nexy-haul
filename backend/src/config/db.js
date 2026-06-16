const mongoose = require('mongoose');

// connectDB is an async function that establishes the MongoDB connection.
// We export it so server.js can call it at startup — before the server
// starts accepting requests. You never want to accept traffic before
// your DB is connected.

const connectDB = async () => {
    try {
        // mongoose.connect() returns a promise — we await it.
        // process.env.MONGO_URI comes from our .env file via dotenv.
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These options prevent deprecation warnings and ensure
            // Mongoose uses the modern MongoDB driver behavior.
            // In Mongoose 6+, these are set by default, but explicit is better.
        });

        // conn.connection.host tells you which MongoDB cluster you connected to.
        // Useful to confirm you're hitting the right DB (dev vs production).
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If we can't connect to the DB, the app cannot function.
        // Log the error clearly and exit the process immediately.
        // process.exit(1) means exit with failure code (1 = error).
        // This prevents the server from starting in a broken state.
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;