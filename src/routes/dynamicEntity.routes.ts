import { Router } from "express";
import { DynamicEntityController } from "../controllers/DynamicEntityController";

const router = Router();
const dynamicEntityController = new DynamicEntityController();

/**
 * @swagger
 * tags:
 *   name: Dynamic Entities
 *   description: Dynamic entity management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DynamicEntity:
 *       type: object
 *       required:
 *         - name
 *         - schema
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the dynamic entity
 *         schema:
 *           type: object
 *           description: JSON schema defining the entity structure
 *           example:
 *             title: string
 *             description: text
 *             price: number
 *         data:
 *           type: object
 *           description: Actual data stored in the entity
 *           example:
 *             title: "My Entity"
 *             description: "Description"
 *             price: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/entities:
 *   post:
 *     tags: [Dynamic Entities]
 *     summary: Create a new dynamic entity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - schema
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Product"
 *               schema:
 *                 type: object
 *                 example:
 *                   title: string
 *                   description: text
 *                   price: number
 *     responses:
 *       201:
 *         description: Entity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DynamicEntity'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", dynamicEntityController.create);

/**
 * @swagger
 * /api/entities:
 *   get:
 *     tags: [Dynamic Entities]
 *     summary: Get all dynamic entities
 *     responses:
 *       200:
 *         description: List of all dynamic entities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DynamicEntity'
 *       500:
 *         description: Server error
 */
router.get("/", dynamicEntityController.findAll);

/**
 * @swagger
 * /api/entities/{id}:
 *   get:
 *     tags: [Dynamic Entities]
 *     summary: Get a dynamic entity by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DynamicEntity'
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.get("/:id", dynamicEntityController.findOne);


/**
 * @swagger
 * /api/entities/{id}:
 *   delete:
 *     tags: [Dynamic Entities]
 *     summary: Delete a dynamic entity
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       204:
 *         description: Entity deleted successfully
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", dynamicEntityController.delete);

/**
 * @swagger
 * /api/entities/{name}/columns:
 *   patch:
 *     tags: [Dynamic Entities]
 *     summary: Update multiple columns of a dynamic entity
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columns
 *             properties:
 *               columns:
 *                 type: object
 *                 example:
 *                   price: number
 *                   stock: number
 *                   description: text
 *     responses:
 *       200:
 *         description: Columns updated successfully
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.patch("/:name/columns", dynamicEntityController.updateColumns);

/**
 * @swagger
 * /api/entities/{name}/columns:
 *   post:
 *     tags: [Dynamic Entities]
 *     summary: Add a new column to a dynamic entity
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - columnName
 *               - columnType
 *             properties:
 *               columnName:
 *                 type: string
 *                 example: "category"
 *               columnType:
 *                 type: string
 *                 example: "string"
 *     responses:
 *       201:
 *         description: Column added successfully
 *       404:
 *         description: Entity not found
 *       500:
 *         description: Server error
 */
router.post("/:name/columns", dynamicEntityController.addColumn);

/**
 * @swagger
 * /api/entities/{name}/columns/{columnName}:
 *   delete:
 *     tags: [Dynamic Entities]
 *     summary: Remove a column from a dynamic entity
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity name
 *       - in: path
 *         name: columnName
 *         required: true
 *         schema:
 *           type: string
 *         description: Column name to remove
 *     responses:
 *       204:
 *         description: Column removed successfully
 *       404:
 *         description: Entity or column not found
 *       500:
 *         description: Server error
 */
router.delete("/entities/:name/columns/:columnName", dynamicEntityController.removeColumn);

export default router;