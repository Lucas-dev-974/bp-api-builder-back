import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { Controller } from "../entities/Controller";

const controllerRepository = AppDataSource.getRepository(Controller);

export class ControllerController {
  /**
   * @swagger
   * /api/controllers:
   *   post:
   *     tags: [Controllers]
   *     summary: Create a new controller
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
      if (!code.includes('res.')) {
        return res.status(400).json({ 
          message: "Controller code must include a response (res.json, res.send, etc.)" 
        });
      }

      const controller = controllerRepository.create({
        name,
        code,
        description
      });

      await controllerRepository.save(controller);
      return res.status(201).json(controller);
    } catch (error) {
      return res.status(500).json({ message: "Error creating controller", error });
    }
  }

  /**
   * @swagger
   * /api/controllers:
   *   get:
   *     tags: [Controllers]
   *     summary: Get all controllers
   */
  async findAll(req: Request, res: Response) {
    try {
      const controllers = await controllerRepository.find({
        relations: ["routes"]
      });
      return res.json(controllers);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching controllers", error });
    }
  }

  /**
   * @swagger
   * /api/controllers/{id}:
   *   get:
   *     tags: [Controllers]
   *     summary: Get a controller by ID
   */
  async findOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const controller = await controllerRepository.findOne({
        where: { id },
        relations: ["routes"]
      });
      if (!controller) {
        return res.status(404).json({ message: "Controller not found" });
      }
      return res.json(controller);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching controller", error });
    }
  }

  /**
   * @swagger
   * /api/controllers/{id}:
   *   put:
   *     tags: [Controllers]
   *     summary: Update a controller
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, description } = req.body;

      // Validation basique du code
      if (code && !code.includes('res.')) {
        return res.status(400).json({ 
          message: "Controller code must include a response (res.json, res.send, etc.)" 
        });
      }

      const controller = await controllerRepository.findOne({
        where: { id },
        relations: ["routes"]
      });

      if (!controller) {
        return res.status(404).json({ message: "Controller not found" });
      }

      controllerRepository.merge(controller, { name, code, description });
      const results = await controllerRepository.save(controller);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ message: "Error updating controller", error });
    }
  }

  /**
   * @swagger
   * /api/controllers/{id}:
   *   delete:
   *     tags: [Controllers]
   *     summary: Delete a controller
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const controller = await controllerRepository.findOne({ where: { id } });
      if (!controller) {
        return res.status(404).json({ message: "Controller not found" });
      }
      await controllerRepository.remove(controller);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting controller", error });
    }
  }
}