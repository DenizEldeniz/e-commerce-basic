import { useState, useEffect } from 'react';
import type { Product } from '../types';

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching and managing products
 * @param selectedCategory - Optional category filter
 * @returns Products data, loading state, error state, and refetch function
 */
export const useProducts = (selectedCategory?: string): UseProductsReturn => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = 'http://localhost:3000/products';
            if (selectedCategory) {
                url += `?category=${selectedCategory}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts,
    };
};
