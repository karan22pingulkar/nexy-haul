const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Create the Express application instance.
// This object holds all your middleware and routes.
// We do NOT call app.listen() here — that's server.js's job.
const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────

// helmet() automatically sets ~15 HTTP headers that protect against
// common attacks: clickjacking, XSS, MIME sniffing, etc.
// Always use this in production. One line = a lot of security.
app.use(helmet());

// cors() allows browsers on OTHER origins (your frontend domain/port)
// to make requests to this API. Without this, the browser blocks them.
// In production, replace '*' with your actual frontend URL.
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL  // Only your frontend in production
        : '*',                       // All origins allowed in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── RATE LIMITING ───────────────────────────────────────────────────────────

// Limits how many requests one IP can make in a window.
// Without this, a single user or bot can overwhelm your server.
// 100 requests per 15 minutes is reasonable for most APIs.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 100,                  // Maximum requests per IP per window
    standardHeaders: true,     // Send rate limit info in response headers
    legacyHeaders: false,      // Disable old X-RateLimit headers
    message: {
        status: 'fail',
        message: 'Too many requests from this IP. Please try again later.',
    },
});

// Apply rate limiter to all routes starting with /api
app.use('/api', limiter);

// ─── REQUEST PARSING ─────────────────────────────────────────────────────────

// Parses incoming requests with JSON bodies (Content-Type: application/json)
// Without this, req.body is undefined when client sends JSON.
// limit: '10kb' prevents clients from sending huge payloads to crash the server.
app.use(express.json({ limit: '10kb' }));

// Parses URL-encoded form data (Content-Type: application/x-www-form-urlencoded)
// extended: false means use the simple querystring library (no nested objects)
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── LOGGING ─────────────────────────────────────────────────────────────────

// morgan logs every HTTP request to the console.
// 'dev' format: METHOD URL STATUS RESPONSE_TIME - SIZE
// Example: GET /api/products 200 34ms - 1234
// Only log in development. In production, use a proper logger like Winston.
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

// A simple route to confirm the server is running.
// Load balancers and monitoring tools ping this endpoint.
// It should always return 200 quickly.
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
// Features will be mounted here as we build them. Example:
// app.use('/api/v1/products', productRoutes);
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/orders', orderRoutes);

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

// notFound must be AFTER all routes.
// If no route above matched, this creates a 404 error.
app.use(notFound);

// errorHandler must be LAST — after notFound.
// It catches ALL errors passed via next(error) from anywhere in the app.
app.use(errorHandler);

module.exports = app;