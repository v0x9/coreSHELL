import bcrypt from "bcrypt";
import User from "../models/User.js";

export const DEMO_USER = {
    username: "recruiter_demo",
    email: "demo@coreshell.dev",
    password: "coreshell_demo"
};

export async function seedDemoUser() {
    try {
        const existingUser = await User.findOne({ where: { email: DEMO_USER.email } });
        if (!existingUser) {
            const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
            await User.create({
                username: DEMO_USER.username,
                email: DEMO_USER.email,
                passwordHash
            });
            console.log(`[Seed] Successfully seeded demo account (${DEMO_USER.email})`);
        } else {
            console.log(`[Seed] Demo account already exists (${DEMO_USER.email})`);
        }
    } catch (error) {
        console.warn("[Seed] Warning: Could not seed demo user:", error);
    }
}
