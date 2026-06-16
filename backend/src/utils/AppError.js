// AppError extends the built-in JavaScript Error class.
// This gives us a way to create errors with an HTTP status code attached.
// Instead of throwing generic errors, we throw AppError so our
// error handler knows exactly what status code to send the client.

class AppError extends Error {
    constructor(message, statusCode) {
        // super(message) calls the parent Error class constructor.
        // This sets this.message = message and captures the stack trace.
        super(message);

        // Attach the HTTP status code (e.g., 400, 401, 404, 500)
        this.statusCode = statusCode;

        // status is a string: '4xx' errors are 'fail' (client's fault)
        // '5xx' errors are 'error' (server's fault)
        // String(statusCode) converts number to string so .startsWith() works
        this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';

        // isOperational = true means this is an expected, handled error
        // (wrong password, not found, validation failed, etc.)
        // Unexpected bugs will NOT have this flag — we handle them differently
        this.isOperational = true;

        // Captures where this error was thrown in the stack trace,
        // excluding the AppError constructor itself from the trace.
        // This makes debugging much cleaner.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;