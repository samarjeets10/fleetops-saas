const ApiError = require("../utils/ApiError");


const validate = (schema) => (req, res, next) => {

    const result = schema.safeParse(req.body);
    if(!result.success) {
        const details = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
        return next(ApiError.badRequest("Validation failed", details));
    }

    req.body = result.data;
    next();

}


module.exports = validate;