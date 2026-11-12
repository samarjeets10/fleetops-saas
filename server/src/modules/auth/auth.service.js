const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../../utils/ApiError");
const User = require("../../models/user.model");


const toSafeUser = (u) => ({
    id: u._id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName
});

const signAccessToken = (user) => jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_ACCESS_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
);

async function register({ email, firstName, lastName, password }) {

    if (await User.findOne({ email })) {
        throw ApiError.conflict("Email already registerd");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName
    });

    return {
        user: toSafeUser(user),
        accessToken: signAccessToken(user)
    };
};


async function login({ email, password }) {
    const user = await User.findOne({ email });

    const ok = user && user.isActive && (await bcrypt.compare(password, user.passwordHash));

    if (!ok) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    user.lastLoginAt = new Date();
    await user.save();

    return {
        user: toSafeUser(user),
        accessToken: signAccessToken(user)
    };
};

module.exports = {
    register,
    login
}