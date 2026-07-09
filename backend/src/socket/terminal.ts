import { Server, Socket } from "socket.io";
import SessionService from "../services/SessionService.js";
import { SessionStatus } from "../types/session.js";
import { Session } from "../models/index.js";
import { socketMiddleware } from "../auth/socketMiddleware.js";



export function registerTerminal(io: Server) {


    io.on("connection", (socket: Socket) => {
        let stream: NodeJS.ReadWriteStream | null = null;
        let sessionService = new SessionService();
        let session: Session | null = null;
        console.log(`Client connected ${socket.id}`);
        io.use(socketMiddleware);
        registerTerminal(io);
        socket.on("start_terminal", async () => {
            const { userId } = socket.data.user.userId ;
            try {

                session = await sessionService.createSession(userId);

                socket.emit("terminal_started", { sessionId: session.id });
            } catch (err) {
                console.error(err);
                socket.emit("terminal_error", { message: "Failed to start terminal" });
            }
        });

        socket.on("attach_terminal", async (data: { sessionId: string }) => {
            const { sessionId } = data;
            try {
                session = await sessionService.getSession(sessionId);
                if (!session) {
                    socket.emit("terminal_error", {
                        message: "Session not found",
                    });
                    return;
                }
                if (stream) {
                    socket.emit("terminal_error", {
                        message: "Terminal already attached",
                    });
                    return;
                }
                stream = await sessionService.attachSession(sessionId);

                // Cancel any pending disconnect since the user reattached
                await sessionService.cancelDisconnect(sessionId);

                stream.on("data", (output: Buffer) => {
                    socket.emit("terminal_output", {
                        output: output.toString(),
                    })
                })
                stream.on("end", () => {

                    socket.emit("terminal_exit")
                });
                stream.on("error", (err) => {

                    console.error(err);

                    socket.emit("terminal_error", {
                        message: "Terminal stream closed",
                    });

                    socket.emit("terminal_attached", {
                        message: "Terminal attached",
                    });

                });

            } catch (err) {
                console.error(err);
                socket.emit("terminal_error", { message: "Failed to attach terminal" });
            }
        });

        socket.on("terminal_input", async (data: { input: string }) => {
            const { input } = data;
            try {
                if (!stream) {
                    socket.emit("terminal_error", {
                        message: "Terminal not attached",
                    });
                    return;
                } await sessionService.updateActivity(session.id);
                stream.write(input);
            } catch (err) {
                console.error(err);
                socket.emit("terminal_error", { message: "Failed to send input to terminal" });
            }

        });

        socket.on("terminal_resize", async (data: { rows: number, cols: number }) => {
            if (!session) return;
            try {
                const { rows, cols } = data;
                await sessionService.resizeSession(session.id, rows, cols);
            } catch (err) {
                console.error("Failed to resize terminal:", err);
            }
        });

        //set status to paused when user disconnects
        socket.on("disconnect", async () => {
            if (session) {
                await sessionService.setStatus(session.id, SessionStatus.PAUSED);

                // Start the 600 seconds counter in Redis
                await sessionService.markDisconnected(session.id);

                console.log(`Disconnected ${socket.id}`);
            }
        });

    });
}       