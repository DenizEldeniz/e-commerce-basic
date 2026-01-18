import { Router } from 'express';
import productRoutes from './products';
import categoryRoutes from './categories';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export default router;
