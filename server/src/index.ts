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
// --- SWAGGER AYARLARI ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-Ticaret API',
            version: '2.0.0',
            description: 'React Frontend için Backend API (Yeni Mimari)',
        },
        servers: [
            { url: 'http://localhost:3000' },
        ],
        paths: {
            '/products': {
                get: {
                    summary: 'Tüm ürünleri (varyantlarıyla) getir',
                    parameters: [
                        {
                            in: 'query',
                            name: 'category',
                            schema: { type: 'string' },
                            description: 'Kategoriye göre filtrele (ayakkabi | kiyafet)',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Başarılı ürün listesi',
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
                    summary: 'Yeni ürün ve varyantlarını ekle',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProductInput' },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Ürün başarıyla eklendi' },
                        400: { description: 'Validation Hatası' },
                    },
                },
            },
            '/products/{id}': {
                get: {
                    summary: 'Tek bir ürün detayı',
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
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
                        },
                        404: { description: 'Ürün bulunamadı' },
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
                        imageUrl: { type: 'string', description: 'Ana resim (Opsiyonel, images[0] yoksa)' },
                        images: { type: 'array', items: { type: 'string' }, description: 'Resim URLleri listesi' },
                        category: { type: 'string', enum: ['ayakkabi', 'kiyafet'] },
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

// 1. Tüm Ürünleri Getir
app.get('/products', async (req, res) => {
    const { category } = req.query;
    try {
        const products = await prisma.product.findMany({
            where: category ? { category: String(category) } : {},
            include: { variants: true, images: true }, // Varyantları ve Resimleri dahil et
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ürünler çekilemedi' });
    }
});

// 2. Tek Ürün Getir
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { variants: true, images: true },
        });
        if (!product) return res.status(404).json({ error: 'Ürün bulunamadı' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Hata oluştu' });
    }
});

// 3. Ürün Ekle (Transaction ile Product + Variants + Images)
app.post('/products', async (req, res) => {
    try {
        const { name, basePrice, description, imageUrl, images, category, brand, variants } = req.body;

        // 1. Temel Validation (imageUrl zorunluluğu kalktı, images[] varsa oradan alırız)
        // Eğer images[] varsa ilkini imageUrl yaparız.
        const mainImage = imageUrl || (images && images.length > 0 ? images[0] : null);

        if (!name || basePrice === undefined || !description || !mainImage || !category) {
            return res.status(400).json({ error: 'Zorunlu alanlar eksik (İsim, Fiyat, Açıklama, Resim, Kategori).' });
        }

        // 2. Kategori Validation
        if (!['ayakkabi', 'kiyafet'].includes(category)) {
            return res.status(400).json({ error: 'Geçersiz kategori. Sadece "ayakkabi" veya "kiyafet" olabilir.' });
        }

        // 3. Fiyat Validation
        const priceNum = parseFloat(basePrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            return res.status(400).json({ error: 'Fiyat 0 dan büyük olmalıdır.' });
        }

        // 4. Varyant Kontrolü
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({ error: 'En az bir varyant (beden/numara) eklemelisiniz.' });
        }

        // 5. Varyant detay validation
        const validSizesKiyafet = ['XS', 'S', 'M', 'L', 'XL'];

        for (const v of variants) {
            if (category === 'ayakkabi') {
                // Sayısal mi kontrol et
                if (isNaN(Number(v.size))) {
                    return res.status(400).json({ error: `Ayakkabı numarası sayısal olmalıdır. (Hatalı: ${v.size})` });
                }
            } else if (category === 'kiyafet') {
                // İzin verilen stringler mi
                if (!validSizesKiyafet.includes(v.size)) {
                    return res.status(400).json({ error: `Kıyafet bedeni şu değerlerden biri olmalıdır: ${validSizesKiyafet.join(', ')}. (Hatalı: ${v.size})` });
                }
            }

            // Stok Validation
            if (v.stock !== undefined && (typeof v.stock !== 'number' || v.stock < 0)) {
                return res.status(400).json({ error: `Stok miktarı 0'dan küçük olamaz. (Hatalı Varyant: ${v.size} - Stok: ${v.stock})` });
            }
        }

        // 6. DB Kayıt (Product + Variants + Images nested create)
        const newProduct = await prisma.product.create({
            data: {
                name,
                basePrice: priceNum,
                description,
                imageUrl: mainImage,
                category,
                brand: brand || "Genel",
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
        console.error("Ürün ekleme hatası:", error);
        res.status(500).json({ error: 'Ürün eklenirken sunucu hatası oluştu.' });
    }
});

// 4. Kategorileri Getir (Sabit ya da DB'den distinct)
app.get('/categories', async (req, res) => {
    // Kurallara göre sadece iki kategori var, bunları statik de dönebiliriz ama 
    // DB'de olanları dönmek istersek yine distinct kullanabiliriz.
    // Ancak kural "Sadece iki kategori olacak" dediği için statik göndermek daha güvenli ve hızlı.
    res.json(['ayakkabi', 'kiyafet']);
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu: http://localhost:${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});