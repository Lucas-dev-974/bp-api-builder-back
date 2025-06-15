import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { Route } from "../entities/Route";
import { Middleware } from "../entities/Middleware";
import { Controller } from "../entities/Controller";

const routeRepository = AppDataSource.getRepository(Route);
const middlewareRepository = AppDataSource.getRepository(Middleware);
const controllerRepository = AppDataSource.getRepository(Controller);

export class RouteController {
  /**
   * @swagger
   * /api/routes:
   *   post:
   *     tags: [Routes]
   *     summary: Create a new route
   */
  async create(req: Request, res: Response) {
    try {
      const { path, method, description, middlewareIds, controllerIds } = req.body;
      
      const route = routeRepository.create({
        path,
        method,
        description
      });

      if (middlewareIds) {
        const middlewares = await middlewareRepository.findByIds(middlewareIds);
        route.middlewares = middlewares;
      }

      if (controllerIds) {
        const controllers = await controllerRepository.findByIds(controllerIds);
        route.controllers = controllers;
      }

      await routeRepository.save(route);
      return res.status(201).json(route);
    } catch (error) {
      return res.status(500).json({ message: "Error creating route", error });
    }
  }

  /**
   * @swagger
   * /api/routes:
   *   get:
   *     tags: [Routes]
   *     summary: Get all routes
   */
  async findAll(req: Request, res: Response) {
    try {
      const routes = await routeRepository.find({
        relations: ["middlewares", "controllers"]
      });
      return res.json(routes);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching routes", error });
    }
  }

  /**
   * @swagger
   * /api/routes/{id}:
   *   get:
   *     tags: [Routes]
   *     summary: Get a route by ID
   */
  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await routeRepository.findOne({
        where: { id },
        relations: ["middlewares", "controllers"]
      });
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      return res.json(route);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching route", error });
    }
  }

  /**
   * @swagger
   * /api/routes/{id}:
   *   put:
   *     tags: [Routes]
   *     summary: Update a route
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { path, method, description, middlewareIds, controllerIds } = req.body;
      
      const route = await routeRepository.findOne({
        where: { id },
        relations: ["middlewares", "controllers"]
      });

      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }

      routeRepository.merge(route, { path, method, description });

      if (middlewareIds) {
        const middlewares = await middlewareRepository.findByIds(middlewareIds);
        route.middlewares = middlewares;
      }

      if (controllerIds) {
        const controllers = await controllerRepository.findByIds(controllerIds);
        route.controllers = controllers;
      }

      const results = await routeRepository.save(route);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ message: "Error updating route", error });
    }
  }

  /**
   * @swagger
   * /api/routes/{id}:
   *   delete:
   *     tags: [Routes]
   *     summary: Delete a route
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const route = await routeRepository.findOne({ where: { id } });
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      await routeRepository.remove(route);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting route", error });
    }
  }
}