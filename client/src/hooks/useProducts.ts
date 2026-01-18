import { useState, useEffect } from 'react';
import apiService from '../services/api';
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
            const data = await apiService.getProducts(selectedCategory);
            setProducts(data as Product[]);
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
