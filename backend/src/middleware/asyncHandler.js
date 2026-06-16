// This is a higher-order function — a function that takes another function
// and returns a new function.
//
// Problem it solves:
// Every async route handler can throw an error. If you forget to write
// try/catch in every single controller function, Node.js crashes.
//
// Solution:
// Wrap every async controller with asyncHandler. If it throws,
// the error is automatically passed to Express's error middleware
// via next(error) — no try/catch needed in controllers.

const asyncHandler = (fn) => {
    // Returns a new function that Express will call with (req, res, next)
    return (req, res, next) => {
        // fn(req, res, next) calls the original async controller.
        // .catch(next) catches any rejected promise and passes the error
        // to Express's next() — which triggers the error handler middleware.
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;