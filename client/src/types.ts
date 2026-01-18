export interface Variant {
    id: number;
    productId: number;
    size: string;
    stock: number;
}

export interface ProductImage {
    id: number;
    url: string;
    productId: number;
}

export interface Product {
    id: number;
    name: string;
    basePrice: number;
    description: string;
    imageUrl: string; // fallback main image
    images?: ProductImage[];
    category: string;
    brand?: string;
    variants: Variant[];
    createdAt: string;
}

export interface CartItem {
    cartId: string; // Unique ID (productID + size + timestamp)
    productName: string;
    price: number;
    imageUrl: string;
    size: string;
    quantity: number;
    variantId: number;
    maxStock: number;
}
