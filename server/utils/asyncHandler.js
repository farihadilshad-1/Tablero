/**
 * Wraps an async controller function so any thrown/rejected error
 * is automatically forwarded to Express's error-handling middleware,
 * removing the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
