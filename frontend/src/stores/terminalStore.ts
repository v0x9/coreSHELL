import { create } from "zustand";
import {connect as connectSocket,disconnect as disconnectSocket ,getSocket , isConnected} from "../socket/socket"
interface TerminalState {


    containerId : string | null ;

    sessionId : string | null ;

    connected : boolean;

    connect: () => Promise<void>;

    startTerminal : () => Promise<void>;

    attach : () => Promise<void>;

    sendInput : (input : string) => void ;

    disconnect : () => void ;


}

export const useTerminalState = create<TerminalState>((set)=>({

    containerId : null ,

    sessionId : null ,

    connected : false ,

    connect : async () =>{

        const token = localStorage.getItem("token");

        if(!token){

            throw new Error("User not authenticated")


        }
        connectSocket();

        set({
            connected : true,
        })


    },

    startTerminal : async () =>{

        const socket = getSocket();

        socket.emit("start_terminal");

        socket.once("terminal_started", (data) => {

            set({
                containerId: data.containerId,
            });

        });
    },

    attach : async () =>{
        const socket = getSocket();

        const containerId =
            useTerminalState.getState().containerId;

        if (!containerId) {
            throw new Error("No container");
        }

        socket.emit("attach_terminal", {
            containerId,
        });

        socket.once("terminal_output", (data) => {

            console.log(data.output);

        });

        socket.once("terminal_exit", () => {

            console.log("Terminal exited");

        });
    },

    sendInput : async (input : string) =>{
        const socket = getSocket();

        socket.emit("terminal_input", {
            input,
        });

    },
    disconnect : async () =>{
        disconnectSocket();

        set({

            containerId: null,

            sessionId: null,

            connected: false,

        });
    }
    
}));