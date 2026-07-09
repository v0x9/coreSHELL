import { Socket } from "socket.io";
import jwt from "../auth/jwt.js";
export async function socketMiddleware(socket: Socket, next: (err?: any) => void) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Unauthorized"));
    }

    try {
        const payload = jwt.verifyToken(token);
        socket.data.userId = payload.userId;
        next();
    } catch (err) {
        return next(new Error("Invalid token"));
    }
}