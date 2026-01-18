export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    TIMEOUT: 10000,
} as const;

export const CATEGORIES = {
    SHOES: 'shoes',
    CLOTHING: 'clothing',
} as const;

export const SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'date-desc', label: 'Newest Arrivals' },
    { value: 'date-asc', label: 'Oldest' },
] as const;

export const TOAST_DURATION = 3000;

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
