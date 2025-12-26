import {
  Wilaya,
  Baladiya,
  DeliveryCostCalculation,
  LocationSearchResult,
  LocationApiResponse
} from '@/types/location';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class LocationApiService {
  async getWilayas(): Promise<LocationApiResponse<Wilaya[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/wilayas`);
      return await response.json();
    } catch (error) {
      console.error('Get wilayas error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch wilayas',
        },
      };
    }
  }

  async getWilayaById(id: number): Promise<LocationApiResponse<Wilaya & { baladiya: Baladiya[] }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/wilayas/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Get wilaya by ID error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch wilaya',
        },
      };
    }
  }

  async getBaladiyaByWilaya(wilayaId: number): Promise<LocationApiResponse<{
    wilaya: { id: number; name: string };
    baladiya: Baladiya[];
    count: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/wilayas/${wilayaId}/baladiya`);
      return await response.json();
    } catch (error) {
      console.error('Get baladiya by wilaya error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch baladiya',
        },
      };
    }
  }

  async calculateDeliveryCost(data: {
    wilayaId: number;
    totalAmount: number;
    weight?: number;
    isExpress?: boolean;
    deliveryType?: 'HOME' | 'STOP_DESK';
  }): Promise<LocationApiResponse<DeliveryCostCalculation>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations/delivery-cost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Calculate delivery cost error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to calculate delivery cost',
        },
      };
    }
  }

  async searchLocations(
    query: string,
    type: 'wilaya' | 'baladiya' | 'all' = 'all',
    limit: number = 20
  ): Promise<LocationApiResponse<LocationSearchResult>> {
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/locations/search?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Search locations error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to search locations',
        },
      };
    }
  }
}

export const locationService = new LocationApiService();