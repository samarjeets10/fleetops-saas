/**
 * Standardized success envelope. Controllers should respond with
 * `res.status(x).json(new ApiResponse(x, data, message))` so every
 * endpoint — success or failure — has the same top-level shape.
 */

class ApiResponse {
    constructor(statusCode, data = null, message = "success") {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}


module.exports = ApiResponse;