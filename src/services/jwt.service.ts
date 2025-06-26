import jwt, { SignOptions } from "jsonwebtoken";
import { SuperUser } from "../entities/SuperUser";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export class JwtService {
    static generateToken(user: SuperUser): string {
        const payload = {
            id: user.id,
            email: user.email,
            roles: user.roles
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        } as SignOptions);
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
} 