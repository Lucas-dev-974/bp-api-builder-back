import { Router } from "express";
import { ControllerController } from "../controllers/ControllerController";

const router = Router();
const controllerController = new ControllerController();

/**
 * @swagger
 * tags:
 *   name: Controllers
 *   description: Controller management endpoints
 */

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
router.post("/controllers", controllerController.create);

/**
 * @swagger
 * /api/controllers:
 *   get:
 *     tags: [Controllers]
 *     summary: Get all controllers
 */
router.get("/controllers", controllerController.findAll);

/**
 * @swagger
 * /api/controllers/{id}:
 *   get:
 *     tags: [Controllers]
 *     summary: Get a controller by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/controllers/:id", controllerController.findOne);

/**
 * @swagger
 * /api/controllers/{id}:
 *   put:
 *     tags: [Controllers]
 *     summary: Update a controller
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put("/controllers/:id", controllerController.update);

/**
 * @swagger
 * /api/controllers/{id}:
 *   delete:
 *     tags: [Controllers]
 *     summary: Delete a controller
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/controllers/:id", controllerController.delete);

export default router;