import { createClient } from "redis";
import SessionService from "../services/SessionService.js";
import client from "../redis/client.js";

class Reaper {
    private subscriber;
    private sessionService: SessionService;

    constructor() {
        // We need a duplicate client specifically for subscribing to events
        this.subscriber = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });
        this.sessionService = new SessionService();
    }

    async start() {
        try {
            await this.subscriber.connect();
            
            // Tell Redis to enable keyspace notifications for expired keys ("E" = keyevent, "x" = expired)
            await client.configSet("notify-keyspace-events", "Ex");

            // Subscribe to the expiration channel (0 is the default database)
            await this.subscriber.subscribe("__keyevent@0__:expired", async (message: string) => {
                // The message will be the exact key name that expired (e.g. "session:123-456")
                if (message.startsWith("session:")) {
                    const sessionId = message.split(":")[1];
                    if (!sessionId) return;
                    console.log(`[Reaper] Redis timeout reached. Reaping session: ${sessionId}`);
                    
                    try {
                        // This stops the container, destroys it, and updates DB status to TERMINATED
                        await this.sessionService.destroySession(sessionId);
                        console.log(`[Reaper] Successfully terminated session: ${sessionId}`);
                    } catch (error) {
                        console.error(`[Reaper] Failed to reap session ${sessionId}:`, error);
                    }
                }
            });

            console.log("[Reaper] Reaper started! Listening for session expirations...");
        } catch (error) {
            console.error("[Reaper] Failed to start Reaper:", error);
        }
    }
}

export default Reaper;