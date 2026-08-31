const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const logger = require("./config/logger");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
    const startAt = Date.now();
    res.on("finish", () => {
        logger.info("request", {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startAt,
        });
    });

    next();
});


app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        uptimeSeconds: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});


app.use(notFound);
app.use(errorHandler);

module.exports = app;