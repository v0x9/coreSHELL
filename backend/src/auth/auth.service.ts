import bcrypt from "bcrypt";
import User from "../models/User.js";
import JWTService from "./jwt.js";

class AuthService {

    async register(username: string, email: string, password: string ) {
        let existingUser = await User.findOne({ where: {username} });

        if (existingUser) {
            throw new Error("Username already exists");
        }
        existingUser = await User.findOne({ where: {email} });
        if (existingUser) {
            throw new Error("Email already exists");
        }
        const passwordHash  = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, passwordHash });
        return JWTService.generateToken({ userId: user.id, email: user.email });
    }
    

    async login(email: string, password: string ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }
        return JWTService.generateToken({ userId: user.id, email: user.email });
    }







}

export default AuthService;