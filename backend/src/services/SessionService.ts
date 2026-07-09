import { Session } from "../models/index.js";
import SandboxManager from "../sandbox/manager.js";
import manager from "../sandbox/manager.js";
import { SessionStatus } from "../types/session.js";
import SessionCache from "../redis/sessionCache.js";
class SessionService {
        private manager : SandboxManager;
        private sessionCache :  SessionCache;
        constructor(){
                this.manager = new SandboxManager();
                this.sessionCache = new SessionCache();
        }
        async createSession(userId: string){
            //check if user already has a paused session, if yes then return that session
            
            const existingSession = await Session.findOne({
                where: {
                    userId,
                    status: SessionStatus.PAUSED
                }
            });
            if (existingSession) {
                // Refresh the cache if we are returning a paused session
                await this.sessionCache.saveSession(existingSession.id, existingSession.containerId);
                return existingSession;
            }
            const containerId = await this.manager.createContainer();

            const session = await Session.create({
                userId,
                containerId,
                status: SessionStatus.RUNNING,
                lastActivity: new Date(),
            });
            await this.sessionCache.saveSession(session.id, containerId);


            return session;
        }
        
        async getSession (sessionId: string){
            const session = await Session.findByPk(sessionId);
            return session;
        }
        async attachSession(sessionId: string){
            // Try to get containerId directly from Redis cache first
            let containerId = await this.sessionCache.getContainer(sessionId);
            
            if (!containerId) {
                // Fallback to Database if cache missed
                const session = await this.getSession(sessionId);
                if (!session) {
                    throw new Error("Session not found");
                }
                containerId = session.containerId;
                // Repopulate cache
                await this.sessionCache.saveSession(sessionId, containerId);
            }
            
            const stream = await this.manager.attach(containerId);
            return stream;
        }

        async resizeSession(sessionId: string, rows: number, cols: number) {
            // Check Redis cache for fast container lookup
            let containerId = await this.sessionCache.getContainer(sessionId);
            
            if (!containerId) {
                const session = await this.getSession(sessionId);
                if (!session) throw new Error("Session not found");
                containerId = session.containerId;
                await this.sessionCache.saveSession(sessionId, containerId);
            }

            await this.manager.resize(containerId, rows, cols);
        }

        async updateActivity(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            session.lastActivity = new Date();
            await session.save();
        }

        async markDisconnected(sessionId: string) {
            await this.sessionCache.markDisconnected(sessionId);
        }

        async cancelDisconnect(sessionId: string) {
            await this.sessionCache.cancelDisconnect(sessionId);
        }


        async setStatus(sessionId: string, status: SessionStatus){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            session.status = status;
            await session.save();
        }

        async stopSession(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            await this.manager.stop(session.containerId);
            await this.setStatus(sessionId, SessionStatus.STOPPED);
            // Clear from Redis since the session is stopped
            await this.sessionCache.removeSession(sessionId);
        }
        //hvent thought yet for stop and destroy session, maybe we can just destroy the container and set the status to terminated, or we can stop the container and set the status to stopped, and then destroy it later when the user wants to terminate it
        async destroySession(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            await this.manager.destroy(session.containerId);
            await this.setStatus(sessionId, SessionStatus.TERMINATED);
            // Clear from Redis since the session is destroyed
            await this.sessionCache.removeSession(sessionId);
        }
}

export default SessionService;