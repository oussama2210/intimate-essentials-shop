import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export class LocationController {
  static async getWilayas(req: Request, res: Response): Promise<void> {
    try {
      const wilayas = await prisma.wilaya.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              baladiya: true,
              users: true,
              orders: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: wilayas,
        count: wilayas.length,
      });
    } catch (error) {
      console.error('Get wilayas error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch wilayas',
        },
      });
    }
  }

  static async getWilayaById(req: Request, res: Response): Promise<void> {
    try {
      const wilayaIdSchema = z.object({
        id: z.string().transform((val) => parseInt(val, 10)).pipe(
          z.number().int().min(1).max(58, 'Invalid wilaya ID')
        ),
      });

      const { id } = wilayaIdSchema.parse(req.params);

      const wilaya = await prisma.wilaya.findUnique({
        where: { id },
        include: {
          baladiya: {
            orderBy: { name: 'asc' }
          },
          deliveryZones: true,
          _count: {
            select: {
              baladiya: true,
              users: true,
              orders: true
            }
          }
        }
      });

      if (!wilaya) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Wilaya not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: wilaya,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid wilaya ID',
            details: error.errors,
          },
        });
      } else {
        console.error('Get wilaya by ID error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch wilaya',
          },
        });
      }
    }
  }

  static async getBaladiyaByWilaya(req: Request, res: Response): Promise<void> {
    try {
      const wilayaIdSchema = z.object({
        wilayaId: z.string().transform((val) => parseInt(val, 10)).pipe(
          z.number().int().min(1).max(58, 'Invalid wilaya ID')
        ),
      });

      const { wilayaId } = wilayaIdSchema.parse(req.params);

      // First check if wilaya exists
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: wilayaId },
        select: { id: true, name: true }
      });

      if (!wilaya) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Wilaya not found',
          },
        });
        return;
      }

      const baladiya = await prisma.baladiya.findMany({
        where: { wilayaId },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              users: true,
              orders: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: {
          wilaya,
          baladiya,
          count: baladiya.length,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid wilaya ID',
            details: error.errors,
          },
        });
      } else {
        console.error('Get baladiya by wilaya error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to fetch baladiya',
          },
        });
      }
    }
  }

  static async calculateDeliveryCost(req: Request, res: Response): Promise<void> {
    try {
      const deliveryCostSchema = z.object({
        wilayaId: z.number().int().min(1).max(58, 'Invalid wilaya ID'),
        totalAmount: z.number().positive('Total amount must be positive'),
        weight: z.number().positive().optional(),
        isExpress: z.boolean().optional().default(false),
        deliveryType: z.enum(['HOME', 'STOP_DESK']).optional().default('HOME'),
      });

      const validatedData = deliveryCostSchema.parse(req.body);

      // Get wilaya info
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: validatedData.wilayaId },
      });

      if (!wilaya) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Wilaya not found',
          },
        });
        return;
      }

      // Calculate delivery cost based on type
      let baseCost = 0;
      if (validatedData.deliveryType === 'STOP_DESK') {
        baseCost = Number(wilaya.officeDeliveryCost);
      } else {
        baseCost = Number(wilaya.homeDeliveryCost);
      }

      // Add weight-based cost if provided (50 DA per kg above 1kg)
      if (validatedData.weight && validatedData.weight > 1) {
        const extraWeight = validatedData.weight - 1;
        baseCost += extraWeight * 50;
      }

      // Express delivery surcharge (50% more)
      if (validatedData.isExpress) {
        baseCost *= 1.5;
      }

      // Free delivery for orders above 5000 DA (except for remote areas)
      const freeDeliveryThreshold = 5000;
      const isRemoteArea = baseCost > 1500; // Adjusted threshold for remote areas

      let finalCost = baseCost;
      let freeDelivery = false;

      if (validatedData.totalAmount >= freeDeliveryThreshold && !isRemoteArea) {
        finalCost = 0;
        freeDelivery = true;
      }

      // Estimated delivery time
      let estimatedDays = 3; // Default
      if (validatedData.isExpress) {
        estimatedDays = Math.max(1, Math.floor(estimatedDays / 2));
      }

      res.json({
        success: true,
        data: {
          wilaya: {
            id: wilaya.id,
            name: wilaya.name,
            code: wilaya.code,
          },
          deliveryCost: Math.round(finalCost),
          baseCost: Math.round(baseCost),
          freeDelivery,
          freeDeliveryThreshold,
          estimatedDays,
          isExpress: validatedData.isExpress,
          deliveryType: validatedData.deliveryType,
          isRemoteArea,
          breakdown: {
            baseCost: Math.round(baseCost),
            weightSurcharge: validatedData.weight && validatedData.weight > 1
              ? Math.round((validatedData.weight - 1) * 50)
              : 0,
            expressSurcharge: validatedData.isExpress
              ? Math.round(baseCost * 0.5)
              : 0,
          }
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        });
      } else {
        console.error('Calculate delivery cost error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to calculate delivery cost',
          },
        });
      }
    }
  }

  static async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const searchSchema = z.object({
        q: z.string().min(2, 'Search query must be at least 2 characters'),
        type: z.enum(['wilaya', 'baladiya', 'all']).optional().default('all'),
        limit: z.string().transform((val) => parseInt(val, 10)).pipe(
          z.number().int().min(1).max(50).optional().default(20)
        ),
      });

      const { q, type, limit } = searchSchema.parse(req.query);

      const results: any = {
        wilayas: [],
        baladiya: [],
      };

      // Search wilayas
      if (type === 'wilaya' || type === 'all') {
        results.wilayas = await prisma.wilaya.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ]
          },
          take: type === 'wilaya' ? limit : Math.floor(limit / 2),
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { baladiya: true }
            }
          }
        });
      }

      // Search baladiya
      if (type === 'baladiya' || type === 'all') {
        results.baladiya = await prisma.baladiya.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { postalCode: { contains: q, mode: 'insensitive' } },
            ]
          },
          take: type === 'baladiya' ? limit : Math.floor(limit / 2),
          orderBy: { name: 'asc' },
          include: {
            wilaya: {
              select: {
                id: true,
                name: true,
                code: true,
              }
            }
          }
        });
      }

      const totalResults = results.wilayas.length + results.baladiya.length;

      res.json({
        success: true,
        data: results,
        query: q,
        type,
        totalResults,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: error.errors,
          },
        });
      } else {
        console.error('Search locations error:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to search locations',
          },
        });
      }
    }
  }
}