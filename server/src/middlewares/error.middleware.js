const env = require("../config/env");
const logger = require("../config/logger");
const ApiError = require("../utils/ApiError");

/**
 * Translates whatever error came in — ours or a library's — into a
 * consistent ApiError so the rest of the handler only deals with one
 * shape.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Mongoose schema validation failure
  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => e.message);
    return new ApiError(400, "Validation failed", details);
  }

  // Malformed ObjectId / bad cast (e.g. garbage value passed as an :id param)
  if (err.name === "CastError") {
    return new ApiError(400, `Invalid value for field '${err.path}'`);
  }

  // Mongo duplicate key violation (unique index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return new ApiError(
      409,
      field ? `${field} already exists` : "Duplicate value"
    );
  }

  // JWT failures
  if (err.name === "JsonWebTokenError") {
    return new ApiError(401, "Invalid authentication token");
  }
  if (err.name === "TokenExpiredError") {
    return new ApiError(401, "Authentication token expired");
  }

  // Anything else is an unexpected/programmer error — never trust its
  // message enough to hand it to the client.
  return new ApiError(500, "Internal server error", null, false);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (normalized.isOperational) {
    logger.warn(normalized.message, {
      method: req.method,
      path: req.originalUrl,
      statusCode: normalized.statusCode,
    });
  } else {
    logger.error(err.message, {
      method: req.method,
      path: req.originalUrl,
      stack: err.stack,
    });
  }

  const body = {
    success: false,
    message: normalized.message,
    ...(normalized.details ? { details: normalized.details } : {}),
    ...(env.NODE_ENV !== "production" && !normalized.isOperational
      ? { stack: err.stack }
      : {}),
  };

  res.status(normalized.statusCode).json(body);
}

module.exports = errorHandler;