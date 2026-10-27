import {Router} from "express";
import AuthService from "../auth/auth.service.js";
import { authMiddleware } from "../auth/middleware.js";
import User from "../models/User.js";

import { DEMO_USER } from "../database/seed.js";

const router = Router();

const authService = new AuthService();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    //could hv added validation here but for now we will keep it simple
    try {
        const token = await authService.register(username, email, password);
        const user = await User.findOne({
            where: { email },
            attributes: { exclude: ['passwordHash'] }
        });
        res.status(201).json({ token, user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await authService.login(email, password);
        const user = await User.findOne({
            where: { email },
            attributes: { exclude: ['passwordHash'] }
        });
        res.status(200).json({ token, user });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/demo", async (_req, res) => {
    try {
        const token = await authService.login(DEMO_USER.email, DEMO_USER.password);
        const user = await User.findOne({
            where: { email: DEMO_USER.email },
            attributes: { exclude: ['passwordHash'] }
        });
        res.status(200).json({ token, user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
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