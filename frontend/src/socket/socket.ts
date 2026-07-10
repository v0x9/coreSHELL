import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
const SOCKET_URL = "http://localhost:3000";

let socket: Socket | null = null;



export function connect(): Socket {
    const token  = useAuthStore.getState().token;
    // Already connected
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log(`Socket connected: ${socket?.id}`);
    });

    socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection failed:", err.message);
    });

    return socket;
}

export function disconnect(): void {

    if (!socket) return;

    socket.disconnect();
    socket = null;
}

export function getSocket(): Socket {

    if (!socket) {
        throw new Error("Socket has not been initialized");
    }

    return socket;
}

export function isConnected(): boolean {
    return socket?.connected ?? false;
}