import { Router } from "express";
import { MiddlewareController } from "../controllers/MiddlewareController";

const router = Router();
const middlewareController = new MiddlewareController();

/**
 * @swagger
 * tags:
 *   name: Middlewares
 *   description: Middleware management endpoints
 */

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
router.post("/middlewares", middlewareController.create);

/**
 * @swagger
 * /api/middlewares:
 *   get:
 *     tags: [Middlewares]
 *     summary: Get all middlewares
 */
router.get("/middlewares", middlewareController.findAll);

/**
 * @swagger
 * /api/middlewares/{id}:
 *   get:
 *     tags: [Middlewares]
 *     summary: Get a middleware by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/middlewares/:id", middlewareController.findOne);

/**
 * @swagger
 * /api/middlewares/{id}:
 *   put:
 *     tags: [Middlewares]
 *     summary: Update a middleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put("/middlewares/:id", middlewareController.update);

/**
 * @swagger
 * /api/middlewares/{id}:
 *   delete:
 *     tags: [Middlewares]
 *     summary: Delete a middleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/middlewares/:id", middlewareController.delete);

export default router;