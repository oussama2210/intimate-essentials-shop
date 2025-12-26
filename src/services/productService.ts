import { Product } from '@/types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ProductApiResponse {
    success: boolean;
    data?: Product | Product[];
    error?: {
        code: string;
        message: string;
    };
    message?: string;
}

class ProductApiService {
    private getAuthHeaders(token?: string) {
        const authToken = token || localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
        };
    }

    async getProducts(filters?: {
        category?: string;
        featured?: boolean;
        isActive?: boolean;
    }): Promise<ProductApiResponse> {
        try {
            const params = new URLSearchParams();
            if (filters?.category) params.append('category', filters.category);
            if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
            if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

            const queryString = params.toString();
            const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Get products error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to fetch products',
                },
            };
        }
    }

    async getProductById(id: string): Promise<ProductApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Get product error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to fetch product',
                },
            };
        }
    }

    async createProduct(product: Omit<Product, 'id'>): Promise<ProductApiResponse> {
        try {
            const payload = {
                ...product,
                stockQuantity: product.stock,
                categoryName: product.category,
                // Remove frontend specific fields if necessary, but extra fields might be ignored by Zod unless strict
            };

            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            return await response.json();
        } catch (error) {
            console.error('Create product error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to create product',
                },
            };
        }
    }

    async updateProduct(id: string, product: Partial<Product>): Promise<ProductApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(product),
            });

            return await response.json();
        } catch (error) {
            console.error('Update product error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to update product',
                },
            };
        }
    }

    async deleteProduct(id: string): Promise<ProductApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            return await response.json();
        } catch (error) {
            console.error('Delete product error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to delete product',
                },
            };
        }
    }
}

export const productService = new ProductApiService();
