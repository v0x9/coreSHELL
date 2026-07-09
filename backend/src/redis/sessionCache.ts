import { Session } from "../models/index.js";

import client from "./client.js";

class SessionCache {
    

    async saveSession(sessionId: string, containerId: string) {
        await client.set(`session:${sessionId}`, containerId);

    }

    async getContainer(sessionId: string) {
        return await client.get(`session:${sessionId}`);
    }

    async markDisconnected(sessionId: string) {
        await client.expire(`session:${sessionId}`, 60 * 10); // expire in 10 minutes
    }

    async cancelDisconnect(sessionId: string) {
        await client.persist(`session:${sessionId}`);
    }

    async removeSession(sessionId: string) {
        await client.del(`session:${sessionId}`);
    }
    async hasSession(sessionId: string) {

        return await client.exists(
            `session:${sessionId}`
        );

    }

}
export default SessionCache ;