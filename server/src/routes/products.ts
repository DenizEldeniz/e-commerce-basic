import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products with optional category filter
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [shoes, clothing]
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getAllProducts.bind(productController));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProductById.bind(productController));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - basePrice
 *               - category
 *               - description
 *               - variants
 *             properties:
 *               name:
 *                 type: string
 *               basePrice:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [shoes, clothing]
 *               description:
 *                 type: string
 *               brand:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                     stock:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post('/', productController.createProduct.bind(productController));

export default router;
