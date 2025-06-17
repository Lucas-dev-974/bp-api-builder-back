import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { DataSource } from "typeorm";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export class DatabaseController {
    private static readonly RESTART_SCRIPT = path.join(process.cwd(), "restart.bat");
    private static readonly DEFAULT_HOST = "localhost";
    private static readonly DEFAULT_PORT = "5432";

    /**
     * Configure database credentials
     */
    public static async configureCredentials(req: Request, res: Response) {
        try {
            const { username, password, database, host, port } = req.body;

            // Validate required fields
            if (!this.validateRequiredFields(username, password, database, res)) {
                return;
            }

            // Test database connection
            if (!await this.testDatabaseConnection(host, port, username, password, database, res)) {
                return;
            }

            // Save credentials and restart server
            await this.saveCredentialsAndRestart(host, port, username, password, database, res);

        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Test database connection
     */
    private static async testDatabaseConnection(
        host: string,
        port: string,
        username: string,
        password: string,
        database: string,
        res: Response
    ): Promise<boolean> {
        const testDataSource = new DataSource({
            type: "postgres",
            host: host || this.DEFAULT_HOST,
            port: parseInt(port || this.DEFAULT_PORT),
            username,
            password,
            database,
            synchronize: false,
            logging: false
        });

        try {
            await testDataSource.initialize();
            await testDataSource.destroy();
            return true;
        } catch (error) {
            this.handleConnectionError(error, res);
            return false;
        }
    }

    /**
     * Save credentials and restart server
     */
    private static async saveCredentialsAndRestart(
        host: string,
        port: string,
        username: string,
        password: string,
        database: string,
        res: Response
    ) {
        const envPath = path.resolve(process.cwd(), ".env");
        const envContent = `
DB_HOST=${host || this.DEFAULT_HOST}
DB_PORT=${port || this.DEFAULT_PORT}
DB_USERNAME=${username}
DB_PASSWORD=${password}
DB_DATABASE=${database}
        `.trim();

        fs.writeFileSync(envPath, envContent);

        // Execute restart script
        exec(`start /min "" "${this.RESTART_SCRIPT}"`, (error) => {
            if (error) {
                console.error("Failed to execute restart script:", error);
            }
        });

        res.json({
            message: "Database credentials saved successfully",
            status: "server restart"
        });
    }

    /**
     * Validate required fields
     */
    private static validateRequiredFields(
        username: string,
        password: string,
        database: string,
        res: Response
    ): boolean {
        if (!username || !password || !database) {
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
            const credentials = this.getDatabaseCredentials();

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