import { Request, Response } from "express";
import { AppDataSource, getRepo } from "../config/typeorm.config";
import { SuperUser } from "../entities/SuperUser";
import { Like } from "typeorm";
import { JwtService } from "../services/jwt.service";

export class SuperUserController {
    private static superUserRepository = () => getRepo(SuperUser);

    /**
     * Create a new super user
     */
    public static async create(req: Request, res: Response) {
        try {
            const { email, password, firstName, lastName, roles } = req.body;
            console.log(req.body);
            const repo = AppDataSource.getRepository(SuperUser)
            // Check if user already exists
            const existingUser = await repo.findOne({
                where: { email }
            });


            if (existingUser) {
                console.log("use exist");
                return res.status(400).json({
                    error: "User already exists with SuperUserController email"
                });
            }

            console.log(SuperUserController.superUserRepository());

            // Create new user
            const superUser = SuperUserController.superUserRepository().create({
                email,
                password,
                firstName,
                lastName,
                roles: roles || []
            });

            await SuperUserController.superUserRepository().save(superUser);

            // Generate token for new user
            const token = JwtService.generateToken(superUser as SuperUser);

            res.status(201).json({
                user: superUser.toJSON(),
                token
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to create super user",
                details: error.message
            });
        }
    }

    /**
     * Get all super users
     */
    public static async getAll(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where = search
                ? [
                    { email: Like(`%${search}%`) },
                    { firstName: Like(`%${search}%`) },
                    { lastName: Like(`%${search}%`) }
                ]
                : {};

            const [users, total] = await SuperUserController.superUserRepository().findAndCount({
                where,
                skip,
                take: Number(limit),
                order: { createdAt: "DESC" }
            });

            res.json({
                data: users.map(user => user.toJSON()),
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch super users",
                details: error.message
            });
        }
    }

    /**
     * Get a super user by ID
     */
    public static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await SuperUserController.superUserRepository().findOne({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({
                    error: "Super user not found"
                });
            }

            res.json(user.toJSON());
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch super user",
                details: error.message
            });
        }
    }

    /**
     * Update a super user
     */
    public static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { email, password, firstName, lastName, isActive, roles } = req.body;

            const user = await SuperUserController.superUserRepository().findOne({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({
                    error: "Super user not found"
                });
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== user.email) {
                const existingUser = await SuperUserController.superUserRepository().findOne({
                    where: { email }
                });

                if (existingUser) {
                    return res.status(400).json({
                        error: "Email already in use"
                    });
                }
            }

            // Update user
            Object.assign(user, {
                email: email || user.email,
                password: password || user.password,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                isActive: isActive !== undefined ? isActive : user.isActive,
                roles: roles || user.roles
            });

            await SuperUserController.superUserRepository().save(user);

            res.json(user.toJSON());
        } catch (error) {
            res.status(500).json({
                error: "Failed to update super user",
                details: error.message
            });
        }
    }

    /**
     * Delete a super user
     */
    public static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await SuperUserController.superUserRepository().findOne({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({
                    error: "Super user not found"
                });
            }

            await SuperUserController.superUserRepository().remove(user);

            res.json({
                message: "Super user deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to delete super user",
                details: error.message
            });
        }
    }

    /**
     * Login super user
     */
    public static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user: SuperUser = await SuperUserController.superUserRepository().findOne({
                where: { email }
            }) as SuperUser;

            if (!user) {
                return res.status(401).json({
                    error: "Invalid credentials"
                });
            }

            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: "Invalid credentials"
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    error: "Account is inactive"
                });
            }

            // Update last login
            user.lastLoginAt = new Date();
            await SuperUserController.superUserRepository().save(user);

            // Generate JWT token
            const token = JwtService.generateToken(user as SuperUser);

            res.json({
                user: user.toJSON(),
                token
            });
        } catch (error) {
            res.status(500).json({
                error: "Login failed",
                details: error.message
            });
        }
    }
} 