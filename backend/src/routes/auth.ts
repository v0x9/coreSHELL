import {Router} from "express";
import AuthService from "../auth/auth.service.js";
import { authMiddleware } from "../auth/middleware.js";
import User from "../models/User.js";

const router = Router();

const authService = new AuthService();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    //could hv added validation here but for now we will keep it simple
    try {
        const token = await authService.register(username, email, password);
        res.status(201).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await authService.login(email, password);
        res.status(200).json({ token });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['passwordHash'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;