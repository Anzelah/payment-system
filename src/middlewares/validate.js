const { ZodError } = require("zod")
const AppError = require("../utils/AppError");

module.exports = (schema, property = "body") => (req, res, next) => {
    try {
        schema.parse(req[property]) // validate the request
        next()   
    } catch(err) {
        if (err instanceof ZodError) {
            const message = err.issues.map(issue => issue.message).join(", and ");
            console.log(message) //for debugging
            return next(new AppError(message, 400, err.issues))
        }
        next(err)
    }
}
