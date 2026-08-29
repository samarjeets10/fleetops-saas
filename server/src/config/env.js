const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });


const envSchema = z.object({
    NODE_ENV: z.enum(["developement", "test", "production"])
    .default("developement"),

    PORT: z.coerce.number().int().positive().default(3000),

    MONGODB_URI: z.string()
    .min(1, "MONGODB_URI is required"),

    JWT_ACCESS_SECRET: z.string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

    JWT_REFRESH_SECRET: z.string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    CORS_ORIGIN: z.string().default("http://localhost:5173"),

});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.log("Invalid environment configuration. Startup aborted.\n");

    for (const issue of parsed.error.issues) {
        console.error(` -${issue.path.join(".")} : ${issue.message}`);
    }

    console.error(
        "\ncheck your .env file against .env.example and fix the values above."
    );

    process.exit(1);
}

module.exports = parsed.data;