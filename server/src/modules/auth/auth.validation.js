const { z } = require("zod");

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8).max(72);

const registerSchema = Object({
    email,
    password,
    firstName: z.string().trim().min(1).max(50),
    lastName: z.string().trim().min(1).max(50)
});

const loginSchema = z.Object({
    email,
    password: z.string().min(1),
});

module.exports = {
    registerSchema,
    loginSchema
}