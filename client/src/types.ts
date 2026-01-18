/**
 * Product variant (size and stock information)
 */
export interface Variant {
    /** Unique variant identifier */
    id: number;
    /** Associated product ID */
    productId: number;
    /** Size (numeric for shoes, XS-XL for clothing) */
    size: string;
    /** Available stock quantity */
    stock: number;
}

/**
 * Product image
 */
export interface ProductImage {
    /** Unique image identifier */
    id: number;
    /** Image URL */
    url: string;
    /** Associated product ID */
    productId: number;
}

/**
 * Product with all details
 */
export interface Product {
    /** Unique product identifier */
    id: number;
    /** Product name */
    name: string;
    /** Base price in TL */
    basePrice: number;
    /** Product description */
    description: string;
    /** Main product image URL */
    imageUrl: string;
    /** Additional product images */
    images?: ProductImage[];
    /** Product category (shoes | clothing) */
    category: string;
    /** Product brand */
    brand?: string;
    /** Available variants (sizes and stock) */
    variants: Variant[];
    /** Creation timestamp */
    createdAt: string;
}

/**
 * Shopping cart item
 */
export interface CartItem {
    /** Unique cart item identifier */
    cartId: string;
    /** Product name */
    productName: string;
    /** Product price */
    price: number;
    /** Product image URL */
    imageUrl: string;
    /** Selected size */
    size: string;
    /** Quantity in cart */
    quantity: number;
    /** Associated variant ID */
    variantId: number;
    /** Maximum available stock for this variant */
    maxStock: number;
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
    /** Notification message */
    message: string;
    /** Whether toast is visible */
    show: boolean;
    /** Toast type */
    type?: 'success' | 'error' | 'info';
}
