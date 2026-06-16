// This is Express's special 4-argument error middleware.
// Express identifies it as an error handler BECAUSE it has 4 parameters: (err, req, res, next).
// Any time next(error) is called anywhere in the app, Express skips
// all normal middleware and jumps directly here.

const errorHandler = (err, req, res, next) => {
    // If the error already has a statusCode (from AppError), use it.
    // Otherwise default to 500 (Internal Server Error).
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // In development, send full error details so you can debug easily
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            // stack trace shows you exactly where the error was thrown
            stack: err.stack,
            error: err,
        });
    }

    // In production, don't leak internal details to clients.
    // Only send safe, user-friendly messages.
    if (process.env.NODE_ENV === 'production') {
        // isOperational = known/expected errors (wrong input, not found, etc.)
        // These are safe to send to the client.
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }

        // Unknown/unexpected errors (bugs, crashes, third-party failures)
        // Never reveal internals. Log it server-side, send generic message.
        console.error('UNEXPECTED ERROR:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong. Please try again later.',
        });
    }
};

module.exports = errorHandler;