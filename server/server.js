const env = require("./src/config/env");
const logger = require("./src/config/logger");
const app = require("./src/app");
const { connectDB, disconnectDB } = require("./src/config/database");
const { preprocess } = require("zod");

let server;

async function start() {
    try {
        await connectDB();

        server = app.listen(env.PORT, () => {
            logger.info(`Server listening on port ${env.PORT}`), {
                env: env.NODE_ENV,
            };
        });
    } catch (error) {
        logger.error("Failed to start server", { error: error.message });
        process.exit(1);
    }

}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : reason,
  });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

start();