// Load environment variables FIRST — before anything else.
// dotenv reads .env file and adds variables to process.env.
// If this line is not first, process.env.MONGO_URI will be undefined
// when db.js tries to use it.
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// The port to listen on.
// process.env.PORT is set by hosting platforms (Render, Railway) automatically.
// We fallback to 5000 for local development.
const PORT = process.env.PORT || 5000;

// ─── STARTUP SEQUENCE ────────────────────────────────────────────────────────

// This is an immediately invoked async function (IIFE).
// We wrap startup in async so we can await the DB connection
// before starting the HTTP server.

const startServer = async () => {
    try {
        // 1. Connect to MongoDB first.
        //    We await this — server should NOT start without a DB connection.
        await connectDB();

        // 2. Start listening for HTTP requests ONLY after DB is ready.
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// ─── UNHANDLED REJECTION SAFETY NET ─────────────────────────────────────────

// If any Promise in the entire app rejects without a .catch() or try/catch,
// this event fires. Without this, Node.js may crash silently.
// Log it and exit gracefully so the process manager (PM2/Render) can restart it.
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
});

// If a synchronous exception is thrown and nothing catches it,
// this fires. Same response — log and exit.
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

startServer();