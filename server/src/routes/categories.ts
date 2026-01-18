import { Router } from 'express';
import { categoryController } from '../controllers/product.controller';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve list of available product categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["shoes", "clothing"]
 */
router.get('/', categoryController.getAllCategories.bind(categoryController));

export default router;
