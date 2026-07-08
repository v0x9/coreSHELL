// Empty file for user implementation
// Empty file for user implementation

import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import {config} from "./config.js"



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

//temporary socket handler 

io.on("connection", (socket)=>{
    console.log(`Client Connected ${socket.id}`);

    socket.on("disconnect"  , ()=>{
        console.log(`CLient disconnected ${socket.id}`);
    });
})


const PORT = config.port;


server.listen(PORT , ()=>{
    console.log(`Server listening on port ${PORT}`)
});

