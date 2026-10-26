/**
 * Standardized application error. Throwing this (instead of a plain Error)
 * lets the global error handler in server.js return the correct
 * HTTP status code and a clean JSON payload.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
