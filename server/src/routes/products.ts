import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router = Router();

/**
 * GET /products
 * Get all products with optional category filter
 */
router.get('/', productController.getAllProducts.bind(productController));

/**
 * GET /products/:id
 * Get a single product by ID
 */
router.get('/:id', productController.getProductById.bind(productController));

/**
 * POST /products
 * Create a new product
 */
router.post('/', productController.createProduct.bind(productController));

export default router;
