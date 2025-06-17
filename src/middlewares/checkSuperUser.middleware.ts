import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { SuperUser } from "../entities/SuperUser.entity";

export const checkSuperUserExists = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Skip check for super user creation and login routes
        if (
            req.path === "/api/super-users" &&
            req.method === "POST" ||
            req.path === "/api/super-users/login" &&
            req.method === "POST"
        ) {
            return next();
        }

        const superUserRepository = AppDataSource.getRepository(SuperUser);
        const superUserCount = await superUserRepository.count();

        if (superUserCount === 0) {
            return res.status(403).json({
                error: "No super user exists",
                message: "Please create a super user first",
                action: {
                    method: "POST",
                    url: "/api/super-users",
                    body: {
                        email: "string",
                        password: "string",
                        firstName: "string",
                        lastName: "string",
                        roles: ["string"]
                    }
                }
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            error: "Failed to check super user existence",
            details: error.message
        });
    }
}; 