import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
    { path: "/api/super-users", method: "POST" }, // Création de super utilisateur
    { path: "/api/super-users/login", method: "POST" }, // Login
    { path: "/api/database/credentials", method: "POST" }, // Configuration DB
    { path: "/api/database/status", method: "GET" }, // Status DB
    { path: "/api-docs", method: "GET" }, // Documentation Swagger
];

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Vérifier si la route est publique
        const isPublicRoute = publicRoutes.some(
            route =>
                req.path.startsWith(route.path) &&
                req.method === route.method
        );

        if (isPublicRoute) {
            return next();
        }

        // Vérifier le token
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