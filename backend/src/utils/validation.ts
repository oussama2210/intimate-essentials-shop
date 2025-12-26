import { z } from 'zod';

// Admin login validation
export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// User registration validation
export const userRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+213[0-9]{9}$/, 'Phone must be a valid Algerian number (+213xxxxxxxxx)'),
  email: z.string().email('Invalid email address').optional(),
  wilayaId: z.number().int().min(1).max(58, 'Invalid wilaya ID'),
  baladiyaId: z.number().int().positive('Invalid baladiya ID'),
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  categoryId: z.string().cuid('Invalid category ID'),
  isActive: z.boolean().optional().default(true),
});

// Order creation validation
export const orderSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  items: z.array(z.object({
    productId: z.string().cuid('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'Order must have at least one item'),
  deliveryAddress: z.string().min(10, 'Delivery address must be at least 10 characters'),
  wilayaId: z.number().int().min(1).max(58, 'Invalid wilaya ID'),
  baladiyaId: z.number().int().positive('Invalid baladiya ID'),
});

// Category validation
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().cuid('Invalid parent category ID').optional(),
});

// Order status update validation
export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// Delivery cost calculation validation
export const deliveryCostSchema = z.object({
  wilayaId: z.number().int().min(1).max(58, 'Invalid wilaya ID'),
  totalAmount: z.number().positive('Total amount must be positive'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type DeliveryCostInput = z.infer<typeof deliveryCostSchema>;