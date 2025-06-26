import { Express, Router } from "express";
import fs from "fs";
import path from "path";

class RouteManager {
    private static instance: RouteManager;
    private app: Express;
    private routes: Map<string, Router> = new Map();
    private isInitialized: boolean = false;

    public setExpressApp(app: Express) {
        this.app = app
    }

    /**
     * Obtient l'instance singleton du RouteManager
     */
    public static getInstance(): RouteManager {
        if (!RouteManager.instance) {
            RouteManager.instance = new RouteManager();
        }
        return RouteManager.instance;
    }

    public loadRoutesFromDirectory(directory: string = __dirname) {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            // Ignore ce fichier et les fichiers non .ts/.js
            if (
                file === "RouteManager.ts" ||
                file === "RouteManager.js" ||
                !file.match(/\.(ts|js)$/)
            ) {
                return;
            }

            const routePath = path.join(directory, file);
            // Import dynamique du module
            const routeModule = require(routePath);

            // On cherche un export par défaut (le Router)
            const router = routeModule.default || routeModule.router;
            // console.log("set up route", routePath);


            if (router) {
                // Utilise le nom du fichier comme préfixe d'URL (ex: user.routes.ts -> /api/user)

                const routeName = file.replace(/\.routes?\.(ts|js)$/, "");
                // console.log("setup route:", routeName);
                this.app.use(`/api/${routeName}`, router);
                this.routes.set(routeName, router)
                console.log(`✅ Route chargée dynamiquement : /api/${routeName}`);
                router.stack.forEach((middleware: any) => {
                    const method = Object.keys(middleware.route.methods).map(key => key)[0]
                    console.log(method, `/api/${routeName + middleware.route.path}`);
                })

            }
        });
    }

    /**
     * Enregistre une route spécifique
     */
    private async registerRoute(routeData: any): Promise<void> {
        try {
            const router = Router();
            const path = routeData.path || '/';
            const method = routeData.method?.toLowerCase() || 'get';


            // Enregistrer le router dans l'application
            const basePath = routeData.api?.name ? `/api/${routeData.api.name}` : '/api';
            this.app.use(basePath, router);

            // Stocker la référence du router
            this.routes.set(routeData.id, router);

            console.log(`✅ Route enregistrée: ${method.toUpperCase()} ${basePath}${path}`);
        } catch (error) {
            console.error(`❌ Erreur lors de l'enregistrement de la route ${routeData.path}:`, error);
        }
    }



    /**
     * Supprime une route enregistrée
     */
    public removeRoute(routeId: string): boolean {
        const router = this.routes.get(routeId);
        if (router) {
            // Logique pour supprimer la route de l'application
            this.routes.delete(routeId);
            return true;
        }
        return false;
    }

    /**
     * Récupère toutes les routes enregistrées
     */
    public getRegisteredRoutes(): Map<string, Router> {
        return this.routes;
    }

    /**
     * Vérifie si une route est enregistrée
     */
    public isRouteRegistered(routeId: string): boolean {
        return this.routes.has(routeId);
    }

    /**
     * Vérifie si le RouteManager est initialisé
     */
    public getInitializationStatus(): boolean {
        return this.isInitialized;
    }

    /**
     * Réinitialise le RouteManager (pour les tests ou le rechargement)
     */
    public static reset(): void {
        if (RouteManager.instance) {
            RouteManager.instance.routes.clear();
            RouteManager.instance.isInitialized = false;
        }
    }
}

export const routeManager = RouteManager.getInstance()