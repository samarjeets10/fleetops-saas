/**
 * Wraps an async route/controller handler so a rejected promise is
 * forwarded to next(err) instead of crashing the process.
 *
 * Note: Express 5 (used here) already forwards rejected promises from
 * async handlers to the error middleware automatically. This wrapper is
 * kept anyway for explicitness and as a safety net — it's a no-op cost
 * and keeps controller code self-documenting about error propagation.
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;