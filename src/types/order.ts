export interface Order {
    id: string;
    userId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    deliveryCost: number;
    deliveryAddress: string;
    wilayaId: number;
    wilayaName?: string;
    baladiyaId: number;
    baladiyaName?: string;
    trackingNumber: string;
    items: OrderItem[];
    user?: {
        firstName: string;
        lastName: string;
        phone: string;
        email?: string;
    };
    wilaya?: {
        id: number;
        name: string;
        code: string;
    };
    baladiya?: {
        id: number;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

export interface CheckoutFormData {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    wilayaId: number;
    baladiyaId: number;
    deliveryAddress: string;
    notes?: string;
}

export interface CreateOrderRequest extends CheckoutFormData {
    items: {
        productId: string;
        quantity: number;
    }[];
    paymentMethod: PaymentMethod;
}

export interface OrderApiResponse {
    success: boolean;
    data?: Order | Order[];
    error?: {
        code: string;
        message: string;
    };
    message?: string;
}
