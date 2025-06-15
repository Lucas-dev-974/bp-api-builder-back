import { Router } from "express";
import { RouteController } from "../controllers/RouteController";

const router = Router();
const routeController = new RouteController();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Route management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       required:
 *         - path
 *         - method
 *       properties:
 *         path:
 *           type: string
 *           description: The route path (e.g., /users)
 *         method:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE]
 *           description: HTTP method
 *         description:
 *           type: string
 *           description: Route description
 *         middlewareIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of middleware IDs
 *         controllerIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of controller IDs
 */

/**
 * @swagger
 * /api/routes:
 *   post:
 *     tags: [Routes]
 *     summary: Create a new route
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/routes", routeController.create);

/**
 * @swagger
 * /api/routes:
 *   get:
 *     tags: [Routes]
 *     summary: Get all routes
 *     responses:
 *       200:
 *         description: List of all routes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Route'
 *       500:
 *         description: Server error
 */
router.get("/routes", routeController.findAll);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     tags: [Routes]
 *     summary: Get a route by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       200:
 *         description: Route details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.get("/routes/:id", routeController.findOne);

/**
 * @swagger
 * /api/routes/{id}:
 *   put:
 *     tags: [Routes]
 *     summary: Update a route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       200:
 *         description: Route updated successfully
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.put("/routes/:id", routeController.update);

/**
 * @swagger
 * /api/routes/{id}:
 *   delete:
 *     tags: [Routes]
 *     summary: Delete a route
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ID
 *     responses:
 *       204:
 *         description: Route deleted successfully
 *       404:
 *         description: Route not found
 *       500:
 *         description: Server error
 */
router.delete("/routes/:id", routeController.delete);

export default router;