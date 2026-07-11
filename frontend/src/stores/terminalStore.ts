import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {connect as connectSocket,disconnect as disconnectSocket ,getSocket , isConnected} from "../socket/socket"
interface TerminalState {


    sessionId : string | null ;

    connected : boolean;

    connect: () => Promise<void>;

    startTerminal : () => Promise<void>;

    attach : (onData: (data: string) => void) => Promise<void>;

    history: { type: string; text: string }[];

    pushHistory: (item: { type: string; text: string }) => void;

    clearHistory: () => void;

    sendInput : (input : string) => void ;

    disconnect : () => void ;


}

export const useTerminalState = create<TerminalState>()(
  persist(
    (set, get) => ({

    sessionId : null ,

    connected : false ,

    history: [
      { type: 'output', text: 'Welcome to coreSHell v2.0' },
      { type: 'output', text: 'Connecting to server...' }
    ],

    pushHistory: (item) => set((state) => ({ history: [...state.history, item] })),

    clearHistory: () => set({ history: [] }),

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
                sessionId: data.sessionId,
            });

        });
    },

    attach : async (onData) =>{
        const socket = getSocket();

        const sessionId =
            useTerminalState.getState().sessionId;

        if (!sessionId) {
            throw new Error("No session");
        }

        socket.emit("attach_terminal", {
            sessionId,
        });

        // Remove previous listeners to avoid duplicates
        socket.off("terminal_output");
        
        socket.on("terminal_output", (data) => {
            onData(data.output);
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

            sessionId: null,

            connected: false,

        });
    }
    
    }),
    {
      name: 'terminal-storage', // key in storage
      storage: createJSONStorage(() => sessionStorage), // use sessionStorage
      partialize: (state) => ({ history: state.history, sessionId: state.sessionId }), // only persist history and session ID
    }
  )
);