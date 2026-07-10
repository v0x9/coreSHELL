// Empty file for user implementation
import { createClient } from "redis";

const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));

export async function connectRedis() {
    try {
        await client.connect();
        console.log("Connected to Redis");
    } catch (err) {
        console.log("Failed to connect to Redis", err);
        process.exit(1);
    }
}
export default client;