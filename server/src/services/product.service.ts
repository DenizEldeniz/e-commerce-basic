import prisma from '../config/database';
import { ProductInput } from '../types';

/**
 * Product service - handles all database operations for products
 */
export class ProductService {
    /**
     * Get all products with optional category filter
     */
    async getAllProducts(category?: string) {
        return prisma.product.findMany({
            where: category ? { category } : {},
            include: {
                variants: true,
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get a single product by ID
     */
    async getProductById(id: number) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
                images: true,
            },
        });
    }

    /**
     * Create a new product with variants and images
     */
    async createProduct(data: ProductInput) {
        const mainImage = data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : '');
        const priceNum = parseFloat(String(data.basePrice));

        return prisma.product.create({
            data: {
                name: data.name,
                basePrice: priceNum,
                description: data.description,
                imageUrl: mainImage,
                category: data.category,
                brand: data.brand || 'General',
                variants: {
                    create: data.variants.map((v) => ({
                        size: String(v.size),
                        stock: v.stock !== undefined ? Number(v.stock) : 1,
                    })),
                },
                images: {
                    create: (data.images || [mainImage]).map((url) => ({ url })),
                },
            },
            include: {
                variants: true,
                images: true,
            },
        });
    }
}

export default new ProductService();
