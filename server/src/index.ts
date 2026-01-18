import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from './config/swagger';
import { ProductInput, VALID_CATEGORIES, VALID_CLOTHING_SIZES, ApiError } from './types';

const app = express();
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * GET /products
 * Retrieve all products, optionally filtered by category
 */
app.get('/products', async (req: Request, res: Response) => {
    const { category } = req.query;

    try {
        const products = await prisma.product.findMany({
            where: category ? { category: String(category) } : {},
            include: {
                variants: true,
                images: true
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            error: 'Failed to fetch products'
        } as ApiError);
    }
});

/**
 * GET /products/:id
 * Retrieve a single product by ID
 */
app.get('/products/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const productId = parseInt(String(id), 10);

    if (isNaN(productId)) {
        return res.status(400).json({
            error: 'Invalid product ID'
        } as ApiError);
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: true,
                images: true
            },
        });

        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            } as ApiError);
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            error: 'An error occurred while fetching the product'
        } as ApiError);
    }
});

/**
 * POST /products
 * Create a new product with variants
 */
app.post('/products', async (req: Request, res: Response) => {
    try {
        const {
            name,
            basePrice,
            description,
            imageUrl,
            images,
            category,
            brand,
            variants
        }: ProductInput = req.body;

        // Determine main image
        const mainImage = imageUrl || (images && images.length > 0 ? images[0] : null);

        // Validation: Required fields
        if (!name || basePrice === undefined || !description || !mainImage || !category) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Name, price, description, image, and category are required'
            } as ApiError);
        }

        // Validation: Category
        if (!VALID_CATEGORIES.includes(category as any)) {
            return res.status(400).json({
                error: 'Invalid category',
                details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
            } as ApiError);
        }

        // Validation: Price
        const priceNum = parseFloat(String(basePrice));
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({
                error: 'Invalid price',
                details: 'Price must be a number greater than 0'
            } as ApiError);
        }

        // Validation: Variants
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                error: 'Invalid variants',
                details: 'At least one variant (size/stock) is required'
            } as ApiError);
        }

        // Validation: Variant details
        for (const variant of variants) {
            if (category === 'shoes') {
                if (isNaN(Number(variant.size))) {
                    return res.status(400).json({
                        error: 'Invalid shoe size',
                        details: `Shoe sizes must be numeric. Invalid: ${variant.size}`
                    } as ApiError);
                }
            } else if (category === 'clothing') {
                if (!VALID_CLOTHING_SIZES.includes(variant.size as any)) {
                    return res.status(400).json({
                        error: 'Invalid clothing size',
                        details: `Clothing sizes must be one of: ${VALID_CLOTHING_SIZES.join(', ')}. Invalid: ${variant.size}`
                    } as ApiError);
                }
            }

            if (variant.stock !== undefined && (typeof variant.stock !== 'number' || variant.stock < 0)) {
                return res.status(400).json({
                    error: 'Invalid stock quantity',
                    details: `Stock must be a non-negative number. Invalid variant: ${variant.size}`
                } as ApiError);
            }
        }

        // Create product with variants and images
        const newProduct = await prisma.product.create({
            data: {
                name,
                basePrice: priceNum,
                description,
                imageUrl: mainImage,
                category,
                brand: brand || 'General',
                variants: {
                    create: variants.map((v) => ({
                        size: String(v.size),
                        stock: v.stock !== undefined ? Number(v.stock) : 1,
                    })),
                },
                images: {
                    create: (images || [mainImage]).map((url) => ({ url })),
                },
            },
            include: {
                variants: true,
                images: true
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            error: 'Server error while creating product',
            details: error instanceof Error ? error.message : 'Unknown error'
        } as ApiError);
    }
});

/**
 * GET /categories
 * Retrieve all available product categories
 */
app.get('/categories', (_req: Request, res: Response) => {
    res.json([...VALID_CATEGORIES]);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});