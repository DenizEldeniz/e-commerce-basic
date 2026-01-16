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

// --- SWAGGER AYARLARI (Objeye çevirdik, hata riski bitti) ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Ticaret API',
            version: '1.0.0',
            description: 'React Frontend için Backend API',
        },
        servers: [
            { url: 'http://localhost:3000' },
        ],
        // Rotaları burada tanımlıyoruz, yorum satırı okumasına gerek kalmadı
        paths: {
            '/products': {
                get: {
                    summary: 'Tüm ürünleri getir',
                    parameters: [
                        {
                            in: 'query',
                            name: 'category',
                            schema: { type: 'string' },
                            description: 'Kategoriye göre filtrele',
                        },
                    ],
                    responses: {
                        200: { description: 'Başarılı ürün listesi' },
                    },
                },
                post: {
                    summary: 'Yeni ürün ekle',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string' },
                                        price: { type: 'number' },
                                        imageUrl: { type: 'string' },
                                        category: { type: 'string' },
                                        stock: { type: 'integer' },
                                        description: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Ürün başarıyla eklendi' },
                    },
                },
            },
            '/products/{id}': {
                get: {
                    summary: 'Tek bir ürün getir',
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: { type: 'integer' },
                            description: 'Ürün ID',
                        },
                    ],
                    responses: {
                        200: { description: 'Ürün detayı' },
                        404: { description: 'Ürün bulunamadı' },
                    },
                },
            },
        },
    },
    apis: [], // Dosya taramayı kapattık, artık hata veremez!
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API KODLARI ---

// 1. Tüm Ürünleri Getir
app.get('/products', async (req, res) => {
    const { category } = req.query;
    try {
        const products = await prisma.product.findMany({
            where: category ? { category: String(category) } : {},
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ürünler çekilemedi' });
    }
});

// 2. Tek Ürün Getir
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Hata' });
    }
});

// 3. Ürün Ekle
app.post('/products', async (req, res) => {
    try {
        const { name, price, description, imageUrl, category, stock } = req.body;
        const newProduct = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description: description || '',
                imageUrl,
                category,
                stock: parseInt(stock),
            },
        });
        res.json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Ekleme hatası' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});