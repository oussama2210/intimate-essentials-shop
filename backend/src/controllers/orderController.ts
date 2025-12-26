import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema
const createOrderSchema = z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().min(1, 'Phone number is required'),
    customerEmail: z.string().email().optional().or(z.literal('')),
    wilayaId: z.number().int().positive(),
    baladiyaId: z.number().int().positive(),
    deliveryAddress: z.string().min(1, 'Delivery address is required'),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
    })).min(1, 'At least one item is required'),
    paymentMethod: z.enum(['CASH_ON_DELIVERY']),
});

// Generate tracking number
function generateTrackingNumber(): string {
    const prefix = 'SY'; // سيال
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Create order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const validatedData = createOrderSchema.parse(req.body);

        // Calculate order total and verify stock
        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of validatedData.items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId, isActive: true },
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'PRODUCT_NOT_FOUND',
                        message: `Product ${item.productId} not found`,
                    },
                });
            }

            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INSUFFICIENT_STOCK',
                        message: `Insufficient stock for ${product.name}`,
                    },
                });
            }

            const itemTotal = parseFloat(product.price.toString()) * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price,
                totalPrice: itemTotal,
            });
        }

        // Get delivery cost
        const wilaya = await prisma.wilaya.findUnique({
            where: { id: validatedData.wilayaId },
        });

        if (!wilaya) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'WILAYA_NOT_FOUND',
                    message: 'Wilaya not found',
                },
            });
        }

        const deliveryCost = parseFloat(wilaya.deliveryBaseCost.toString());

        // Create or get user
        let user = await prisma.user.findUnique({
            where: { phone: validatedData.customerPhone },
        });

        if (!user) {
            const [firstName, ...lastNameParts] = validatedData.customerName.split(' ');
            user = await prisma.user.create({
                data: {
                    firstName: firstName || validatedData.customerName,
                    lastName: lastNameParts.join(' ') || firstName,
                    phone: validatedData.customerPhone,
                    email: validatedData.customerEmail || null,
                    wilayaId: validatedData.wilayaId,
                    baladiyaId: validatedData.baladiyaId,
                },
            });
        }

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                totalAmount,
                deliveryCost,
                deliveryAddress: validatedData.deliveryAddress,
                wilayaId: validatedData.wilayaId,
                baladiyaId: validatedData.baladiyaId,
                paymentMethod: validatedData.paymentMethod,
                trackingNumber: generateTrackingNumber(),
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                wilaya: true,
                baladiya: true,
            },
        });

        // Update product stock
        for (const item of validatedData.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stockQuantity: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid order data',
                    details: error.errors,
                },
            });
        }

        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CREATE_ORDER_ERROR',
                message: 'Failed to create order',
            },
        });
    }
};

//Get all orders (admin)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { status, wilayaId, limit = '50' } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (wilayaId) where.wilayaId = parseInt(wilayaId as string);

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                wilaya: true,
                baladiya: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: parseInt(limit as string),
        });

        res.json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GET_ORDERS_ERROR',
                message: 'Failed to fetch orders',
            },
        });
    }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                wilaya: true,
                baladiya: true,
                user: true,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found',
                },
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GET_ORDER_ERROR',
                message: 'Failed to fetch order',
            },
        });
    }
};

// Update order status (admin)
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Invalid order status',
                },
            });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                wilaya: true,
                baladiya: true,
            },
        });

        res.json({
            success: true,
            data: order,
            message: 'Order status updated successfully',
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'UPDATE_ORDER_ERROR',
                message: 'Failed to update order status',
            },
        });
    }
};

// Get order by tracking number (public)
export const getOrderByTracking = async (req: Request, res: Response) => {
    try {
        const { trackingNumber } = req.params;

        const order = await prisma.order.findUnique({
            where: { trackingNumber },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                wilaya: true,
                baladiya: true,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ORDER_NOT_FOUND',
                    message: 'Order not found',
                },
            });
        }

        // Don't expose sensitive user info in public endpoint
        const { user, ...orderData } = order as any;

        res.json({
            success: true,
            data: orderData,
        });
    } catch (error) {
        console.error('Get order by tracking error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'GET_ORDER_ERROR',
                message: 'Failed to fetch order',
            },
        });
    }
};
