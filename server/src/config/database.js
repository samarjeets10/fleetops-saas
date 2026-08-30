const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');


mongoose.set("strictQuery", true);

let listenersAttached = false;

function attachConnectionListeners() {
    if(listenersAttached) return;

    listenersAttached = true;

    mongoose.connection.on("connected", () => {
        logger.info("MongoDB connection established");
    })

    mongoose.connection.on("error", (error) => {
        logger.error("MongoDB connection error");
    })

    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB connection lost");
    })
}

/**
 * Opens the MongoDB connection. Callers should await this during startup
 * and treat a rejection as fatal — the app has no business serving
 * requests without a database.
 */

async function connectDB() {

    attachConnectionListeners();

    await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
    });
}

async function disconnectDB() {
    await mongoose.connection.close();
}


module.exports = { connectDB, disconnectDB, mongoose };

