const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API service for making HTTP requests to the backend
 */
class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Generic GET request
     */
    private async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Generic POST request
     */
    private async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async getProducts(category?: string) {
        const endpoint = category ? `/products?category=${category}` : '/products';
        return this.get(endpoint);
    }

    async getProductById(id: number) {
        return this.get(`/products/${id}`);
    }

    async createProduct(data: any) {
        return this.post('/products', data);
    }

    async getCategories() {
        return this.get<string[]>('/categories');
    }
}

export default new ApiService(API_BASE_URL);
