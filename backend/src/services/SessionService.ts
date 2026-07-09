import { Session } from "../models/index.js";
import SandboxManager from "../sandbox/manager.js";
import manager from "../sandbox/manager.js";
import { SessionStatus } from "../types/session.js";

class SessionService {
        private manager : SandboxManager;

        constructor(){
                this.manager = new SandboxManager();
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
                return existingSession;
            }
            const containerId = await this.manager.createContainer();

            const session = await Session.create({
                userId,
                containerId,
                status: SessionStatus.RUNNING,
                lastActivity: new Date(),
            });
            


            return session;
        }
        
        async getSession (sessionId: string){
            const session = await Session.findByPk(sessionId);
            return session;
        }
        async attachSession(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            const stream = await this.manager.attach(session.containerId);
            return stream;
        }

        async updateActivity(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            session.lastActivity = new Date();
            await session.save();
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
        }
        //hvent thought yet for stop and destroy session, maybe we can just destroy the container and set the status to terminated, or we can stop the container and set the status to stopped, and then destroy it later when the user wants to terminate it
        async destroySession(sessionId: string){
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            await this.manager.destroy(session.containerId);
            await this.setStatus(sessionId, SessionStatus.TERMINATED);
        }
}

export default SessionService;