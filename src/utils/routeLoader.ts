// src/utils/routeLoader.ts
import { AppDataSource } from "../config/typeorm.config";
import { Route } from "../entities/Route";
import { Request, Response, NextFunction } from "express";

export class RouteLoader {
  private static async loadMiddleware(middlewareCode: string): Promise<(req: Request, res: Response, next: NextFunction) => void> {
    try {
      // Créer une fonction à partir du code du middleware
      return new Function('req', 'res', 'next', middlewareCode) as (req: Request, res: Response, next: NextFunction) => void;
    } catch (error) {
      console.error('Error loading middleware:', error);
      return (req: Request, res: Response, next: NextFunction) => next();
    }
  }

  private static async loadController(controllerCode: string): Promise<(req: Request, res: Response) => void> {
    try {
      // Créer une fonction à partir du code du contrôleur
      return new Function('req', 'res', controllerCode) as (req: Request, res: Response) => void;
    } catch (error) {
      console.error('Error loading controller:', error);
      return (req: Request, res: Response) => res.status(500).json({ error: 'Controller execution error' });
    }
  }

  public static async loadRoutes(app: any) {
    try {
      const routeRepository = AppDataSource.getRepository(Route);
      const routes = await routeRepository.find({
        relations: ['middlewares', 'controllers']
      });

      for (const route of routes) {
        const middlewares = await Promise.all(
          route.middlewares.map(middleware => this.loadMiddleware(middleware.code))
        );

        const controllers = await Promise.all(
          route.controllers.map(controller => this.loadController(controller.code))
        );

        // Enregistrer la route avec ses middlewares et contrôleurs
        app[route.method.toLowerCase()](
          route.path,
          ...middlewares,
          ...controllers
        );

        console.log(`Route loaded: ${route.method} ${route.path}`);
      }
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  }
}