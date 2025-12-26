import { CreateOrderRequest, OrderApiResponse } from '@/types/order';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class OrderApiService {
    private getAuthHeaders(token?: string) {
        const authToken = token || localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
        };
    }

    async createOrder(orderData: CreateOrderRequest): Promise<OrderApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            return await response.json();
        } catch (error) {
            console.error('Create order error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to create order',
                },
            };
        }
    }

    async getOrders(filters?: {
        status?: string;
        wilayaId?: number;
        limit?: number;
    }): Promise<OrderApiResponse> {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.wilayaId) params.append('wilayaId', String(filters.wilayaId));
            if (filters?.limit) params.append('limit', String(filters.limit));

            const queryString = params.toString();
            const url = `${API_BASE_URL}/api/orders${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            return await response.json();
        } catch (error) {
            console.error('Get orders error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to fetch orders',
                },
            };
        }
    }

    async getOrderById(id: string): Promise<OrderApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
                headers: this.getAuthHeaders(),
            });

            return await response.json();
        } catch (error) {
            console.error('Get order error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to fetch order',
                },
            };
        }
    }

    async getOrderByTracking(trackingNumber: string): Promise<OrderApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/tracking/${trackingNumber}`);
            return await response.json();
        } catch (error) {
            console.error('Get order by tracking error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to fetch order',
                },
            };
        }
    }

    async updateOrderStatus(id: string, status: string): Promise<OrderApiResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status }),
            });

            return await response.json();
        } catch (error) {
            console.error('Update order status error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to update order status',
                },
            };
        }
    }
}

export const orderService = new OrderApiService();
