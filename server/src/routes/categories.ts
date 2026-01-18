import { Router } from 'express';
import { categoryController } from '../controllers/product.controller';

const router = Router();

/**
 * GET /categories
 * Get all available categories
 */
router.get('/', categoryController.getAllCategories.bind(categoryController));

export default router;
