export interface DatabaseConnection {
    username: string;
    password: string;
    database: string;
    host?: string;
    port?: string | number;
}

export interface DatabaseCredentials {
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
} 