import { ProductInput, VALID_CATEGORIES, VALID_CLOTHING_SIZES } from '../types';

/**
 * Validation utilities for product data
 */
export class ProductValidator {
    /**
     * Validate product creation data
     */
    static validateProductInput(data: ProductInput): { valid: boolean; error?: string; details?: string } {
        const mainImage = data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : null);

        // Required fields
        if (!data.name || data.basePrice === undefined || !data.description || !mainImage || !data.category) {
            return {
                valid: false,
                error: 'Missing required fields',
                details: 'Name, price, description, image, and category are required',
            };
        }

        // Category validation
        if (!VALID_CATEGORIES.includes(data.category as any)) {
            return {
                valid: false,
                error: 'Invalid category',
                details: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
            };
        }

        // Price validation
        const priceNum = parseFloat(String(data.basePrice));
        if (isNaN(priceNum) || priceNum <= 0) {
            return {
                valid: false,
                error: 'Invalid price',
                details: 'Price must be a number greater than 0',
            };
        }

        // Variants validation
        if (!data.variants || !Array.isArray(data.variants) || data.variants.length === 0) {
            return {
                valid: false,
                error: 'Invalid variants',
                details: 'At least one variant (size/stock) is required',
            };
        }

        // Variant details validation
        for (const variant of data.variants) {
            if (data.category === 'shoes') {
                if (isNaN(Number(variant.size))) {
                    return {
                        valid: false,
                        error: 'Invalid shoe size',
                        details: `Shoe sizes must be numeric. Invalid: ${variant.size}`,
                    };
                }
            } else if (data.category === 'clothing') {
                if (!VALID_CLOTHING_SIZES.includes(variant.size as any)) {
                    return {
                        valid: false,
                        error: 'Invalid clothing size',
                        details: `Clothing sizes must be one of: ${VALID_CLOTHING_SIZES.join(', ')}. Invalid: ${variant.size}`,
                    };
                }
            }

            if (variant.stock !== undefined && (typeof variant.stock !== 'number' || variant.stock < 0)) {
                return {
                    valid: false,
                    error: 'Invalid stock quantity',
                    details: `Stock must be a non-negative number. Invalid variant: ${variant.size}`,
                };
            }
        }

        return { valid: true };
    }
}
