export interface Wilaya {
  id: number;
  name: string;
  code: string;
  deliveryBaseCost: number;
  _count?: {
    baladiya: number;
    users: number;
    orders: number;
  };
}

export interface Baladiya {
  id: number;
  name: string;
  wilayaId: number;
  postalCode: string;
  wilaya?: {
    id: number;
    name: string;
    code: string;
  };
  _count?: {
    users: number;
    orders: number;
  };
}

export interface DeliveryZone {
  id: string;
  wilayaId: number;
  baseCost: number;
  estimatedDays: number;
  isActive: boolean;
  wilaya?: Wilaya;
}

export interface DeliveryCostCalculation {
  deliveryCost: number;
  baseCost: number;
  freeDelivery: boolean;
  freeDeliveryThreshold: number;
  estimatedDays: number;
  isExpress: boolean;
  deliveryType: 'HOME' | 'STOP_DESK';
  isRemoteArea: boolean;
  breakdown: {
    baseCost: number;
    weightSurcharge: number;
    expressSurcharge: number;
    itemSurcharge: number;
  };
  wilaya: {
    id: number;
    name: string;
    code: string;
  };
}

export interface LocationSearchResult {
  wilayas: Wilaya[];
  baladiya: Baladiya[];
  query: string;
  type: 'wilaya' | 'baladiya' | 'all';
  totalResults: number;
}

export interface LocationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  count?: number;
}