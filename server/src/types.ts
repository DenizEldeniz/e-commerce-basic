export interface VariantInput {
    size: string;
    stock?: number;
}

export interface ProductInput {
    name: string;
    basePrice: number;
    description: string;
    imageUrl?: string;
    images?: string[];
    category: 'shoes' | 'clothing';
    brand?: string;
    variants: VariantInput[];
}

export interface ApiError {
    error: string;
    details?: string;
}

export const VALID_CATEGORIES = ['shoes', 'clothing'] as const;
export const VALID_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

export type Category = typeof VALID_CATEGORIES[number];
export type ClothingSize = typeof VALID_CLOTHING_SIZES[number];
