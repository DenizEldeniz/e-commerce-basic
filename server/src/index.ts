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
                        200: {
                            description: 'Başarılı ürün listesi',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/Product'
                                        }
                                    }
                                }
                            }
                        },
                    },
                },
                post: {
                    summary: 'Yeni ürün ekle',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ProductInput'
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
                        200: {
                            description: 'Ürün detayı',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Product'
                                    }
                                }
                            }
                        },
                        404: { description: 'Ürün bulunamadı' },
                    },
                },
            },
        },
        components: {
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        price: { type: 'number' },
                        description: { type: 'string' },
                        imageUrl: { type: 'string' },
                        category: { type: 'string' },
                        brand: { type: 'string' },
                        stockS: { type: 'integer' },
                        stockM: { type: 'integer' },
                        stockL: { type: 'integer' },
                    }
                },
                ProductInput: {
                    type: 'object',
                    required: ['name', 'price', 'imageUrl', 'category', 'stockS', 'stockM', 'stockL', 'description'],
                    properties: {
                        name: { type: 'string' },
                        price: { type: 'number' },
                        imageUrl: { type: 'string' },
                        category: { type: 'string' },
                        brand: { type: 'string' },
                        stockS: { type: 'integer' },
                        stockM: { type: 'integer' },
                        stockL: { type: 'integer' },
                        description: { type: 'string' },
                    }
                }
            }
        }
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
        const { name, price, description, imageUrl, category, brand, stockS, stockM, stockL } = req.body;

        // 4. Bütün alanlar zorunlu (Brand opsiyonel olabilir, ama ekleyelim)
        // Note: brand schema'da default "Genel" ama burdan gelirse ezeriz.
        if (!name || price == undefined || !description || !imageUrl || !category || stockS === undefined || stockM === undefined || stockL === undefined) {
            return res.status(400).json({ error: 'Bütün alanlar doldurulmak zorundadır.' });
        }

        // ... validations ...
        // 3. Ürün ismi 3 karakterden kısa olamaz
        if (String(name).length < 3) {
            return res.status(400).json({ error: 'Ürün ismi 3 karakterden kısa olamaz.' });
        }

        // 10. Ürün isminde yasaklı karakterler (<, >) olmasın
        if (/[<>]/.test(name)) {
            return res.status(400).json({ error: 'Ürün isminde yasaklı karakterler (<, >) bulunamaz.' });
        }

        // 11. Fiyat 0 ile başlayamaz (örn: 099)
        if (/^0\d/.test(String(price))) {
            return res.status(400).json({ error: 'Fiyat 0 ile başlayamaz.' });
        }

        // 1. Fiyat 10 - 1.000.000 arasında olmalı
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 10 || numPrice > 1000000) {
            return res.status(400).json({ error: 'Fiyat 10 TL ile 1.000.000 TL arasında olmalıdır.' });
        }

        // 2. Kategori sayı olamaz
        if (!isNaN(parseFloat(category)) && isFinite(category)) {
            return res.status(400).json({ error: 'Kategori ismi sadece sayıdan oluşamaz.' });
        }

        // 5. Stok adedi ondalıklı olamaz
        const sS = Number(stockS);
        const sM = Number(stockM);
        const sL = Number(stockL);

        if (!Number.isInteger(sS) || !Number.isInteger(sM) || !Number.isInteger(sL)) {
            return res.status(400).json({ error: 'Stok adetleri tam sayı olmalıdır.' });
        }

        // 7. Açıklama 1000 karakteri geçemez
        if (String(description).length > 1000) {
            return res.status(400).json({ error: 'Açıklama 1000 karakteri geçemez.' });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                price: numPrice,
                description: description,
                imageUrl,
                category,
                brand: brand || "Genel", // Default to Genel if not provided
                stockS: sS,
                stockM: sM,
                stockL: sL,
            },
        });
        res.json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ekleme hatası' });
    }
});

// 4. Kategorileri Getir
app.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.product.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        res.json(categories.map(c => c.category));
    } catch (error) {
        res.status(500).json({ error: 'Kategoriler çekilemedi' });
    }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});