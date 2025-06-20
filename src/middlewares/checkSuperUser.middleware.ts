import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { SuperUser } from "../entities/SuperUser.entity";

export async function checkSuperUserExists(req: Request, res: Response, next: NextFunction) {
    try {
        // Skip check for super user creation and login routes
        const superUserRepository = AppDataSource.getRepository(SuperUser);
        const superUserCount = await superUserRepository.count();

        if (
            req.path === "/api/super-users" &&
            req.method === "POST" ||
            req.path === "/api/super-users/login" &&
            req.method === "POST" ||
            req.method === "GET" && req.path == "/api/database/status" && superUserCount != 0
        ) {
            return next();
        }


        if (superUserCount === 0) {
            return res.status(403).json({
                status: "create super user",
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