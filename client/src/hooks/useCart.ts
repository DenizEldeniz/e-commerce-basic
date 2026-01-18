import { useState, useCallback } from 'react';
import type { CartItem, Product } from '../types';

interface UseCartReturn {
    cart: CartItem[];
    addToCart: (product: Product, selectedSize: string) => { success: boolean; message: string };
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, delta: number, products: Product[]) => { success: boolean; message: string };
    getTotalItems: () => number;
}

/**
 * Custom hook for managing shopping cart state and operations
 * @returns Cart state and cart manipulation functions
 */
export const useCart = (): UseCartReturn => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((product: Product, selectedSize: string) => {
        if (!selectedSize) {
            return {
                success: false,
                message: 'Please select a size first!',
            };
        }

        const variant = product.variants.find((v) => v.size === selectedSize);
        if (!variant) {
            return {
                success: false,
                message: 'Selected size not available',
            };
        }

        const currentCartItem = cart.find((item) => item.variantId === variant.id);
        const currentQty = currentCartItem ? currentCartItem.quantity : 0;

        if (currentQty + 1 > variant.stock) {
            return {
                success: false,
                message: `Insufficient stock! (Available: ${variant.stock})`,
            };
        }

        setCart((prev) => {
            const existingItemIndex = prev.findIndex(
                (item) => item.productName === product.name && item.size === selectedSize
            );

            if (existingItemIndex > -1) {
                const newCart = [...prev];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + 1,
                };
                return newCart;
            } else {
                return [
                    ...prev,
                    {
                        cartId: `${product.id}-${selectedSize}-${Date.now()}`,
                        productName: product.name,
                        price: product.basePrice,
                        imageUrl: product.imageUrl,
                        size: selectedSize,
                        quantity: 1,
                        variantId: variant.id,
                        maxStock: variant.stock,
                    },
                ];
            }
        });

        return {
            success: true,
            message: 'Product added to cart!',
        };
    }, [cart]);

    const removeFromCart = useCallback((cartId: string) => {
        setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    }, []);

    const updateQuantity = useCallback((cartId: string, delta: number, products: Product[]) => {
        let result = { success: true, message: '' };

        setCart((prev) => {
            return prev.map((item) => {
                if (item.cartId === cartId) {
                    const newQuantity = item.quantity + delta;

                    if (newQuantity < 1) {
                        return item;
                    }

                    const productOwner = products.find((p) =>
                        p.variants.some((v) => v.id === item.variantId)
                    );
                    const variant = productOwner?.variants.find((v) => v.id === item.variantId);

                    if (variant && newQuantity > variant.stock) {
                        result = {
                            success: false,
                            message: `Maximum stock limit reached! (${variant.stock})`,
                        };
                        return item;
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });

        return result;
    }, []);

    const getTotalItems = useCallback(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
    };
};
