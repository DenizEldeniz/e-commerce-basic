import { Router } from 'express';
import productRoutes from './products';
import categoryRoutes from './categories';

const router = Router();

// Mount routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;
