import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { Middleware } from "../entities/Middleware";

const middlewareRepository = AppDataSource.getRepository(Middleware);

export class MiddlewareController {
  /**
   * @swagger
   * /api/middlewares:
   *   post:
   *     tags: [Middlewares]
   *     summary: Create a new middleware
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - code
   *             properties:
   *               name:
   *                 type: string
   *               code:
   *                 type: string
   *               description:
   *                 type: string
   */
  async create(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;
      
      // Validation basique du code
      if (!code.includes('next()')) {
        return res.status(400).json({ 
          message: "Middleware code must include next() function call" 
        });
      }

      const middleware = middlewareRepository.create({
        name,
        code,
        description
      });

      await middlewareRepository.save(middleware);
      return res.status(201).json(middleware);
    } catch (error) {
      return res.status(500).json({ message: "Error creating middleware", error });
    }
  }

  /**
   * @swagger
   * /api/middlewares:
   *   get:
   *     tags: [Middlewares]
   *     summary: Get all middlewares
   */
  async findAll(req: Request, res: Response) {
    try {
      const middlewares = await middlewareRepository.find({
        relations: ["routes"]
      });
      return res.json(middlewares);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching middlewares", error });
    }
  }

  /**
   * @swagger
   * /api/middlewares/{id}:
   *   get:
   *     tags: [Middlewares]
   *     summary: Get a middleware by ID
   */
  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const middleware = await middlewareRepository.findOne({
        where: { id },
        relations: ["routes"]
      });
      if (!middleware) {
        return res.status(404).json({ message: "Middleware not found" });
      }
      return res.json(middleware);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching middleware", error });
    }
  }

  /**
   * @swagger
   * /api/middlewares/{id}:
   *   put:
   *     tags: [Middlewares]
   *     summary: Update a middleware
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description } = req.body;

      // Validation basique du code
      if (code && !code.includes('next()')) {
        return res.status(400).json({ 
          message: "Middleware code must include next() function call" 
        });
      }

      const middleware = await middlewareRepository.findOne({
        where: { id },
        relations: ["routes"]
      });

      if (!middleware) {
        return res.status(404).json({ message: "Middleware not found" });
      }

      middlewareRepository.merge(middleware, { name, code, description });
      const results = await middlewareRepository.save(middleware);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ message: "Error updating middleware", error });
    }
  }

  /**
   * @swagger
   * /api/middlewares/{id}:
   *   delete:
   *     tags: [Middlewares]
   *     summary: Delete a middleware
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const middleware = await middlewareRepository.findOne({ where: { id } });
      if (!middleware) {
        return res.status(404).json({ message: "Middleware not found" });
      }
      await middlewareRepository.remove(middleware);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting middleware", error });
    }
  }
}