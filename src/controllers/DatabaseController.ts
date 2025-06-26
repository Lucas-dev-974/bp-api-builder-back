import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { DataSource } from "typeorm";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { DatabaseConnection } from "../interfaces/database.interface";

export class DatabaseController {
    private static readonly RESTART_SCRIPT = path.join(process.cwd(), "restart.bat");
    private static readonly DEFAULT_HOST = "localhost";
    private static readonly DEFAULT_PORT = "5432";

    /**
     * Configure database credentials
     */
    public static async configureCredentials(req: Request, res: Response) {
        try {
            const dbConnectionEntry = req.body as DatabaseConnection;

            // Validate required fields
            if (!DatabaseController.validateRequiredFields(dbConnectionEntry, res)) {
                return;
            }

            // Test database connection
            if (!await DatabaseController.testDatabaseConnection(dbConnectionEntry, res)) {
                return;
            }

            // Save credentials and restart server
            await DatabaseController.saveCredentialsAndRestart(dbConnectionEntry, res);

        } catch (error) {
            console.log(error);
            DatabaseController.handleError(error, res);
        }
    }

    /**
     * Test database connection
     */
    private static async testDatabaseConnection(dbConnection: Partial<DatabaseConnection>,
        res: Response
    ): Promise<boolean> {
        const testDataSource = new DataSource({
            type: "postgres",
            host: dbConnection.host || DatabaseController.DEFAULT_HOST,
            port: parseInt(String(dbConnection.port || DatabaseController.DEFAULT_PORT)),
            username: dbConnection.username,
            password: dbConnection.password,
            database: dbConnection.database,
            synchronize: false,
            logging: false
        });

        try {
            await testDataSource.initialize();
            await testDataSource.destroy();
            return true;
        } catch (error) {
            DatabaseController.handleConnectionError(error, res);
            return false;
        }
    }

    /**
     * Build .env DB conf information
     */
    private static buildEnvDBConfd(dbConnection: Partial<DatabaseConnection>) {
        return `
DB_HOST=${dbConnection.host || DatabaseController.DEFAULT_HOST}
DB_PORT=${dbConnection.port || DatabaseController.DEFAULT_PORT}
DB_USERNAME=${dbConnection.username}
DB_PASSWORD=${dbConnection.password}
DB_DATABASE=${dbConnection.database}
        `.trim();
    }
    /**
     * Save credentials and restart server
     */
    private static async saveCredentialsAndRestart(dbConnection: Partial<DatabaseConnection>, res: Response) {
        const envPath = path.resolve(process.cwd(), ".env");
        const envContent = DatabaseController.buildEnvDBConfd(dbConnection)
        fs.writeFileSync(envPath, envContent);

        // Execute restart script
        exec(`start /min "" "${DatabaseController.RESTART_SCRIPT}"`, (error) => {
            if (error) {
                console.error("Failed to execute restart script:", error);
            }
        });

        res.status(200).json({
            message: "Database credentials saved successfully",
            status: "server restart"
        });
    }

    /**
     * Validate required fields
     */
    private static validateRequiredFields(dbConnection: Partial<DatabaseConnection>, res: Response): boolean {
        if (!dbConnection.username || !dbConnection.password || !dbConnection.database) {
            res.status(400).json({
                error: "Missing required database credentials",
                required: ["username", "password", "database"]
            });
            return false;
        }
        return true;
    }

    /**
     * Handle connection errors
     */
    private static handleConnectionError(error: any, res: Response) {
        let errorMessage = "Connection failed";
        if (error.message.includes("password authentication failed")) {
            errorMessage = "Invalid username or password";
        } else if (error.message.includes("does not exist")) {
            errorMessage = "Database does not exist";
        } else if (error.message.includes("could not connect")) {
            errorMessage = "Could not connect to database server";
        }

        res.status(400).json({
            error: errorMessage,
            details: error.message
        });
    }

    /**
     * Handle general errors
     */
    private static handleError(error: any, res: Response) {
        res.status(500).json({
            error: "Failed to save database credentials",
            details: error.message
        });
    }

    /**
     * Get database status
     */
    public static async getStatus(req: Request, res: Response) {

        try {
            const isInitialized = AppDataSource.isInitialized;
            console.log('locals:', res.locals);

            if (res.locals.superUserCount == 0) {
                res.status(200).json({ status: "create super user" })
                return
            }
            if (!isInitialized) {
                res.status(200).json({ status: "disconnected" })
                return
            }

            const credentials = DatabaseController.getDatabaseCredentials();
            res.json({
                status: isInitialized ? "connected" : "disconnected",
                credentials: credentials ? {
                    host: credentials.host,
                    port: credentials.port,
                    database: credentials.database,
                    username: credentials.username
                } : null
            });
        } catch (error) {
            res.status(500).json({
                error: "Failed to get database status",
                details: error.message
            });
        }
    }

    /**
     * Get database credentials from .env file
     */
    private static getDatabaseCredentials() {
        try {
            const envPath = path.resolve(process.cwd(), ".env");
            if (!fs.existsSync(envPath)) {
                return null;
            }


            const envContent = fs.readFileSync(envPath, "utf-8");
            const credentials: any = {};

            envContent.split("\n").forEach(line => {
                const [key, value] = line.split("=");
                if (key && value) {
                    credentials[key.trim()] = value.trim();
                }
            });

            return credentials;
        } catch (error) {
            console.error("Error reading database credentials:", error);
            return null;
        }
    }
} 