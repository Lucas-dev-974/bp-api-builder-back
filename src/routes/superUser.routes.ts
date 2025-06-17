import { Router } from "express";
import { SuperUserController } from "../controllers/superUser.controller";

const router = Router();

/**
 * @swagger
 * /api/super-users:
 *   post:
 *     summary: Create a new super user
 *     tags: [SuperUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post("/", SuperUserController.create);

/**
 * @swagger
 * /api/super-users:
 *   get:
 *     summary: Get all super users
 *     tags: [SuperUsers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for email, firstName, or lastName
 */
router.get("/", SuperUserController.getAll);

/**
 * @swagger
 * /api/super-users/{id}:
 *   get:
 *     summary: Get a super user by ID
 *     tags: [SuperUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/:id", SuperUserController.getById);

/**
 * @swagger
 * /api/super-users/{id}:
 *   put:
 *     summary: Update a super user
 *     tags: [SuperUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.put("/:id", SuperUserController.update);

/**
 * @swagger
 * /api/super-users/{id}:
 *   delete:
 *     summary: Delete a super user
 *     tags: [SuperUsers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete("/:id", SuperUserController.delete);

/**
 * @swagger
 * /api/super-users/login:
 *   post:
 *     summary: Login super user
 *     tags: [SuperUsers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post("/login", SuperUserController.login);

export default router; 