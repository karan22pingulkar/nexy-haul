const AppError = require('../utils/AppError');

// This middleware runs when NO route matched the incoming request.
// Express executes middleware in order — if nothing above handled the
// request, it falls through to here.
//
// We create an AppError with 404 and call next(error).
// This sends it to the global error handler below.

const notFound = (req, res, next) => {
    // req.originalUrl is the full path the client tried to access
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error); // Pass to error handler
};

module.exports = notFound;