import { Request, Response } from 'express';
import productService from '../services/product.service';
import { ProductValidator } from '../validators/validators';
import { ProductInput, ApiError, VALID_CATEGORIES } from '../types';

/**
 * Product controller - handles HTTP requests for products
 */
export class ProductController {
    /**
     * GET /products
     * Retrieve all products, optionally filtered by category
     */
    async getAllProducts(req: Request, res: Response) {
        const { category } = req.query;

        try {
            const products = await productService.getAllProducts(category ? String(category) : undefined);
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                error: 'Failed to fetch products',
            } as ApiError);
        }
    }

    /**
     * GET /products/:id
     * Retrieve a single product by ID
     */
    async getProductById(req: Request, res: Response) {
        const { id } = req.params;
        const productId = parseInt(String(id), 10);

        if (isNaN(productId)) {
            return res.status(400).json({
                error: 'Invalid product ID',
            } as ApiError);
        }

        try {
            const product = await productService.getProductById(productId);

            if (!product) {
                return res.status(404).json({
                    error: 'Product not found',
                } as ApiError);
            }

            res.json(product);
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({
                error: 'An error occurred while fetching the product',
            } as ApiError);
        }
    }

    /**
     * POST /products
     * Create a new product with variants
     */
    async createProduct(req: Request, res: Response) {
        try {
            const productData: ProductInput = req.body;

            // Validate input
            const validation = ProductValidator.validateProductInput(productData);
            if (!validation.valid) {
                return res.status(400).json({
                    error: validation.error,
                    details: validation.details,
                } as ApiError);
            }

            // Create product
            const newProduct = await productService.createProduct(productData);
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                error: 'Server error while creating product',
                details: error instanceof Error ? error.message : 'Unknown error',
            } as ApiError);
        }
    }
}

/**
 * Category controller
 */
export class CategoryController {
    /**
     * GET /categories
     * Retrieve all available product categories
     */
    async getAllCategories(_req: Request, res: Response) {
        res.json([...VALID_CATEGORIES]);
    }
}

export const productController = new ProductController();
export const categoryController = new CategoryController();
