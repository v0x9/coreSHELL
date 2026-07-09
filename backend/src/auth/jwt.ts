import jwt from "jsonwebtoken";
import {config} from "../config.js";
import type { JWTPayload } from "../types/payload.js";
class JWTService {
    private secretKey: string;

    constructor() {
        this.secretKey = config.jwtSecret ;
    }

    generateToken(payload: JWTPayload): string {
            const token = jwt.sign(payload, this.secretKey, { expiresIn: "1h" });
            return token;
        }

    verifyToken(token: string): JWTPayload | null {
            try {
                const decoded = jwt.verify(token, this.secretKey) as JWTPayload;
                return decoded;
            } catch (err) {
                console.error("Token verification failed:", err);
                return null;
            }
        }

}

export default new JWTService();