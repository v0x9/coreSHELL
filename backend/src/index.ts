// Empty file for user implementation
// Empty file for user implementation

import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import {config} from "./config.js"
import { connectRedis } from "./redis/client.js";
import Reaper from "./sandbox/reaper.js";
import { registerTerminal } from "./socket/terminal.js";
import { connectToDatabase } from "./database/connection.js";



const app = express();

//Middleware

app.use(cors());
app.use(express.json());

//health check 

app.get("/health" , (req , res)=>{
    res.status(200).json({
        status:"OK" , 
        message:"coreSHell backend is running"
    });
});

//creating a http server

const server = http.createServer(app);

//attaching socket io

const io = new Server(server ,{
    cors:{
        origin: "*"
    }
});

// Register terminal socket handlers
registerTerminal(io);
const PORT = config.port;

async function startServer() {
    // 1. Connect to Database
    await connectToDatabase();

    // 2. Connect to Redis
    await connectRedis();

    // 3. Initialize the single global Reaper for all users
    const reaper = new Reaper();
    await reaper.start();

    // 3. Start the HTTP server
    server.listen(PORT , ()=>{
        console.log(`Server listening on port ${PORT}`)
    });
}

startServer();
