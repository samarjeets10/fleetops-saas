const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },

        tokenVersion: {
            type: Number,
            required: true,
            default: 0.
        }

    }, 

    {
        timestamps: true
    }
);

userSchema.methods.toJSON = function toSafeJSON() {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
}



const userModel = mongoose.model("User", userSchema);

module.exports = userModel;