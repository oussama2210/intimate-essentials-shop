const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UploadResponse {
    success: boolean;
    data?: {
        url: string;
        filename: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

class UploadApiService {
    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async uploadImage(file: File): Promise<UploadResponse> {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: this.getAuthHeaders(), // Don't set Content-Type, browser sets it with boundary for FormData
                body: formData,
            });

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Failed to upload image',
                },
            };
        }
    }
}

export const uploadService = new UploadApiService();
