import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DeliveryCalculationInput {
  wilayaId: number;
  totalAmount: number;
  weight?: number;
  isExpress?: boolean;
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface DeliveryCalculationResult {
  deliveryCost: number;
  baseCost: number;
  freeDelivery: boolean;
  freeDeliveryThreshold: number;
  estimatedDays: number;
  isExpress: boolean;
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

export class DeliveryService {
  private static readonly FREE_DELIVERY_THRESHOLD = 5000; // 5000 DA
  private static readonly WEIGHT_SURCHARGE_PER_KG = 50; // 50 DA per kg above 1kg
  private static readonly EXPRESS_MULTIPLIER = 1.5; // 50% surcharge for express
  private static readonly REMOTE_AREA_THRESHOLD = 800; // Areas with base cost > 800 DA
  private static readonly ITEM_SURCHARGE_THRESHOLD = 10; // Surcharge for orders with > 10 items

  static async calculateDeliveryCost(input: DeliveryCalculationInput): Promise<DeliveryCalculationResult | null> {
    try {
      // Get wilaya and delivery zone info
      const wilaya = await prisma.wilaya.findUnique({
        where: { id: input.wilayaId },
        include: {
          deliveryZones: {
            where: { isActive: true }
          }
        }
      });

      if (!wilaya || wilaya.deliveryZones.length === 0) {
        return null;
      }

      const deliveryZone = wilaya.deliveryZones[0];
      const baseCost = Number(deliveryZone.baseCost);

      // Calculate surcharges
      const breakdown = {
        baseCost,
        weightSurcharge: this.calculateWeightSurcharge(input.weight),
        expressSurcharge: input.isExpress ? Math.round(baseCost * (this.EXPRESS_MULTIPLIER - 1)) : 0,
        itemSurcharge: this.calculateItemSurcharge(input.items),
      };

      // Total cost before free delivery check
      let totalCost = breakdown.baseCost + breakdown.weightSurcharge + 
                     breakdown.expressSurcharge + breakdown.itemSurcharge;

      // Check for free delivery
      const isRemoteArea = baseCost > this.REMOTE_AREA_THRESHOLD;
      const freeDelivery = input.totalAmount >= this.FREE_DELIVERY_THRESHOLD && !isRemoteArea;
      
      if (freeDelivery) {
        totalCost = 0;
      }

      // Calculate estimated delivery time
      let estimatedDays = deliveryZone.estimatedDays;
      if (input.isExpress) {
        estimatedDays = Math.max(1, Math.floor(estimatedDays / 2));
      }

      return {
        deliveryCost: Math.round(totalCost),
        baseCost: Math.round(baseCost),
        freeDelivery,
        freeDeliveryThreshold: this.FREE_DELIVERY_THRESHOLD,
        estimatedDays,
        isExpress: input.isExpress || false,
        isRemoteArea,
        breakdown: {
          baseCost: Math.round(breakdown.baseCost),
          weightSurcharge: Math.round(breakdown.weightSurcharge),
          expressSurcharge: Math.round(breakdown.expressSurcharge),
          itemSurcharge: Math.round(breakdown.itemSurcharge),
        },
        wilaya: {
          id: wilaya.id,
          name: wilaya.name,
          code: wilaya.code,
        },
      };
    } catch (error) {
      console.error('Delivery calculation error:', error);
      return null;
    }
  }

  private static calculateWeightSurcharge(weight?: number): number {
    if (!weight || weight <= 1) {
      return 0;
    }
    const extraWeight = weight - 1;
    return extraWeight * this.WEIGHT_SURCHARGE_PER_KG;
  }

  private static calculateItemSurcharge(items?: Array<{ productId: string; quantity: number }>): number {
    if (!items) {
      return 0;
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > this.ITEM_SURCHARGE_THRESHOLD) {
      const extraItems = totalItems - this.ITEM_SURCHARGE_THRESHOLD;
      return extraItems * 25; // 25 DA per extra item
    }

    return 0;
  }

  static async getDeliveryZones(): Promise<any[]> {
    try {
      return await prisma.deliveryZone.findMany({
        where: { isActive: true },
        include: {
          wilaya: {
            select: {
              id: true,
              name: true,
              code: true,
            }
          }
        },
        orderBy: {
          wilaya: {
            name: 'asc'
          }
        }
      });
    } catch (error) {
      console.error('Get delivery zones error:', error);
      return [];
    }
  }

  static async updateDeliveryZone(wilayaId: number, data: {
    baseCost?: number;
    estimatedDays?: number;
    isActive?: boolean;
  }): Promise<boolean> {
    try {
      await prisma.deliveryZone.updateMany({
        where: { wilayaId },
        data: {
          ...(data.baseCost !== undefined && { baseCost: data.baseCost }),
          ...(data.estimatedDays !== undefined && { estimatedDays: data.estimatedDays }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        }
      });
      return true;
    } catch (error) {
      console.error('Update delivery zone error:', error);
      return false;
    }
  }

  static getDeliveryEstimate(wilayaId: number, isExpress: boolean = false): { min: number; max: number } {
    // Base estimates by wilaya ID ranges (approximation)
    let baseDays: number;
    
    if ([16, 9, 35, 42].includes(wilayaId)) { // Alger, Blida, Boumerdes, Tipaza
      baseDays = 1;
    } else if ([31, 2, 27, 13, 22].includes(wilayaId)) { // Oran, Chlef, Mostaganem, Tlemcen, Sidi Bel Abbes
      baseDays = 2;
    } else if ([25, 19, 6, 21, 23].includes(wilayaId)) { // Constantine, Setif, Bejaia, Skikda, Annaba
      baseDays = 2;
    } else if ([11, 30, 33, 37, 47].includes(wilayaId)) { // Tamanrasset, Ouargla, Illizi, Tindouf, Ghardaia
      baseDays = 5;
    } else {
      baseDays = 3; // Default for other wilayas
    }

    if (isExpress) {
      baseDays = Math.max(1, Math.floor(baseDays / 2));
    }

    return {
      min: baseDays,
      max: baseDays + 1,
    };
  }
}