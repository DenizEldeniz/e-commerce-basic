import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Commerce API',
            version: '2.0.0',
            description: 'Backend API for React Frontend (New Architecture)',
        },
        servers: [
            { url: 'http://localhost:3000' },
        ],
        paths: {
            '/products': {
                get: {
                    summary: 'Get all products (with variants)',
                    parameters: [
                        {
                            in: 'query',
                            name: 'category',
                            schema: { type: 'string' },
                            description: 'Filter by category (shoes | clothing)',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Successful product list',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Product' }
                                    }
                                }
                            }
                        },
                    },
                },
                post: {
                    summary: 'Add new product and variants',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductInput' },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Product successfully added' },
                        400: { description: 'Validation Error' },
                    },
                },
            },
            '/products/{id}': {
                get: {
                    summary: 'Get single product details',
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Product ID',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Product details',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
                        },
                        404: { description: 'Product not found' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Variant: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        size: { type: 'string' },
                        stock: { type: 'integer' }

                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        basePrice: { type: 'number' },
                        description: { type: 'string' },
                        imageUrl: { type: 'string' },
                        category: { type: 'string' },
                        brand: { type: 'string' },
                        variants: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Variant' }
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'integer' },
                                    url: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'basePrice', 'category', 'description', 'variants'],
                    properties: {
                        name: { type: 'string' },
                        basePrice: { type: 'number' },
                        imageUrl: { type: 'string', description: 'Main image (Optional, if images[0] exists)' },
                        images: { type: 'array', items: { type: 'string' }, description: 'List of image URLs' },
                        category: { type: 'string', enum: ['shoes', 'clothing'] },
                        brand: { type: 'string' },
                        description: { type: 'string' },
                        variants: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['size'],
                                properties: {
                                    size: { type: 'string' },
                                    stock: { type: 'integer' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API KODLARI ---

app.get('/products', async (req, res) => {
    const { category } = req.query;
    try {
        const products = await prisma.product.findMany({
            where: category ? { category: String(category) } : {},
            include: { variants: true, images: true },
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { variants: true, images: true },
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, basePrice, description, imageUrl, images, category, brand, variants } = req.body;

        const mainImage = imageUrl || (images && images.length > 0 ? images[0] : null);

        if (!name || basePrice === undefined || !description || !mainImage || !category) {
            return res.status(400).json({ error: 'Missing required fields (Name, Price, Description, Image, Category).' });
        }

        if (!['shoes', 'clothing'].includes(category)) {
            return res.status(400).json({ error: 'Invalid category. Must be "shoes" or "clothing".' });
        }

        const priceNum = parseFloat(basePrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({ error: 'Price must be greater than 0.' });
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({ error: 'You must add at least one variant (size/number).' });
        }
        const validSizesClothing = ['XS', 'S', 'M', 'L', 'XL'];

        for (const v of variants) {
            if (category === 'shoes') {
                if (isNaN(Number(v.size))) {
                    return res.status(400).json({ error: `Shoe size must be numeric. (Invalid: ${v.size})` });
                }
            } else if (category === 'clothing') {
                if (!validSizesClothing.includes(v.size)) {
                    return res.status(400).json({ error: `Clothing size must be one of: ${validSizesClothing.join(', ')}. (Invalid: ${v.size})` });
                }
            }

            if (v.stock !== undefined && (typeof v.stock !== 'number' || v.stock < 0)) {
                return res.status(400).json({ error: `Stock amount cannot be less than 0. (Invalid Variant: ${v.size} - Stock: ${v.stock})` });
            }
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                basePrice: priceNum,
                description,
                imageUrl: mainImage,
                category,
                brand: brand || "General",
                variants: {
                    create: variants.map((v: any) => ({
                        size: String(v.size),
                        stock: v.stock !== undefined ? Number(v.stock) : 1
                    }))
                },
                images: {
                    create: (images || [mainImage]).map((url: string) => ({ url }))
                }
            },
            include: { variants: true, images: true }
        });

        res.json(newProduct);

    } catch (error) {
        console.error("Product creation error:", error);
        res.status(500).json({ error: 'Server error while creating product.' });
    }
});

app.get('/categories', async (req, res) => {
    res.json(['shoes', 'clothing']);
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});