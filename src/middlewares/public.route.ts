import { Request } from "express";


export const publicRoutes = [
    { path: "/api/admin", method: "POST" }, // Création de super utilisateur
    { path: "/api/admin/login", method: "POST" }, // Login
    { path: "/api/database/credentials", method: "POST" }, // Configuration DB
    { path: "/api/database/status", method: "GET" }, // Status DB
    { path: "/api-docs", method: "GET" }, // Documentation Swagger
];

export function isPublicRoute(req: Request) {
    return publicRoutes.some(
        route =>
            req.path.startsWith(route.path) &&
            req.method === route.method
    );
}
