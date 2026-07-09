import { Server , Socket } from "socket.io";
import SandboxManager from "../sandbox/manager.js";


const manager = new SandboxManager();



export function registerTerminal(io : Server){


    io.on("connection" , (socket : Socket)=>{
        let stream  : NodeJS.ReadWriteStream | null = null;
        console.log(`Client connected ${socket.id}`);
        
        socket.on("start_terminal" , async (data : {userId : string})=>{
            const {userId} = data;
            try{

                const containerId = await manager.createContainer();
                socket.emit("terminal_started" , {containerId : containerId});
            }catch(err){
                console.error(err);
                socket.emit("terminal_error" , {message : "Failed to start terminal"});
            }
        });

        socket.on("attach_terminal" , async (data : {containerId : string})=>{
            const {containerId} = data;
            try{
                if (stream) {
                    socket.emit("terminal_error", {
                        message: "Terminal already attached",
                    });
                    return;
                }
                stream = await manager.attach(containerId);
                stream.on("data", (output: Buffer) => {
                socket.emit("terminal_output", {
                    output: output.toString(),
                })})
                stream.on("end", () => {

                socket.emit("terminal_exit")});
                stream.on("error", (err) => {

                console.error(err);

                socket.emit("terminal_error", {
                    message: "Terminal stream closed",
                });

                socket.emit("terminal_attached", {
                    message: "Terminal attached",
                });

                });

                }catch(err){
                console.error(err);
                socket.emit("terminal_error" , {message : "Failed to attach terminal"});
            }
        });

        socket.on("terminal_input" , async (data : {input : string})=>{
            const {input} = data;
            try{
                if (!stream) {
                    socket.emit("terminal_error", {
                        message: "Terminal not attached",
                    });
                    return;
}
                stream.write(input);
            }catch(err){
                console.error(err);
                socket.emit("terminal_error" , {message : "Failed to send input to terminal"});
            }

        });

        socket.on("disconnect", () => {

            console.log(`Disconnected ${socket.id}`);

            if (stream) {

                stream.removeAllListeners();

                stream = null;

            }

        });

        
    
    })};       