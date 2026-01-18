/**
 * Format price in Turkish Lira
 */
export const formatPrice = (price: number): string => {
    return `${price.toFixed(2)} TL`;
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
