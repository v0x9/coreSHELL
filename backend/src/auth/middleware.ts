// Empty file for user implementation
import type { Request ,Response ,NextFunction } from "express";
import jwt from "./jwt.js";


export async function authMiddleware(req: Request, res: Response, next: NextFunction)   {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verifyToken(String(token));
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
    
    
}