import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { isPublicRoute } from "./public.route";



export async function authenticate(req: Request, res: Response, next: NextFunction) {
    if (isPublicRoute(req)) return next();
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: "Authentication required",
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                error: "Authentication required",
                message: "Invalid token format"
            });
        }

        try {
            const decoded = JwtService.verifyToken(token);
            req.user = decoded; // Ajouter les informations de l'utilisateur à la requête
            next();
        } catch (error) {
            return res.status(401).json({
                error: "Authentication failed",
                message: "Invalid or expired token"
            });
        }
    } catch (error) {
        res.status(500).json({
            error: "Authentication error",
            details: error.message
        });
    }
}; 