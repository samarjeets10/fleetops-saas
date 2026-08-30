/**
 * Represents a known, expected failure (bad input, missing resource,
 * unauthorized access, etc). Thrown deliberately by services/controllers
 * and translated 1:1 into an HTTP response by the central error handler.
 *
 * `isOperational: true` marks errors that are safe to describe to the
 * client. Anything else (programmer errors, unexpected exceptions) is
 * treated as non-operational and given a generic 500 message instead.
 */

class ApiError extends Error {
  constructor(statusCode, message, details = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message, details = null) {
    return new ApiError(409, message, details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, null, false);
  }
}

module.exports = ApiError;