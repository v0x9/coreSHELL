// Empty file for user implementation
import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || "",
    databaseUrl: process.env.DATABASE_URL || "",
    redisUrl: process.env.REDIS_URL || "",
};