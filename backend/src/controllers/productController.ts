import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  nameEn: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(), // Added categoryName
  stockQuantity: z.number().int().min(0, 'Stock must be non-negative'),
  image: z.string().url('Invalid image URL').optional(),
  featured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
});

const updateProductSchema = createProductSchema.partial();

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, featured, isActive } = req.query;

    const where: any = {};

    if (category) {
      where.category = { name: category };
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      where.isActive = true; // Default to active products only
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend Product type
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn || product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
      image: product.images[0]?.url || product.imageUrl || '/placeholder-product.jpg',
      category: product.category?.name || 'General',
      stock: product.stockQuantity,
      featured: product.featured || false,
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
    }));

    return res.json({
      success: true,
      data: transformedProducts,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GET_PRODUCTS_ERROR',
        message: 'Failed to fetch products',
      },
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }

    const primaryImage = product.images.find(img => img.isPrimary);

    const transformedProduct = {
      id: product.id,
      name: product.name,
      nameEn: product.nameEn || product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
      image: primaryImage?.url || product.imageUrl || '/placeholder-product.jpg',
      category: product.category?.name || 'General',
      stock: product.stockQuantity,
      featured: product.featured || false,
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
    };

    return res.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GET_PRODUCT_ERROR',
        message: 'Failed to fetch product',
      },
    });
    return;
  }
};

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    // Get or create category
    let categoryId = validatedData.categoryId;

    if (!categoryId) {
      const categoryName = validatedData.categoryName || 'General';

      let category = await prisma.category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            description: `${categoryName} products`,
          },
        });
      }
      categoryId = category.id;
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        nameEn: validatedData.nameEn,
        description: validatedData.description,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice,
        stockQuantity: validatedData.stockQuantity,
        categoryId,
        imageUrl: validatedData.image,
        featured: validatedData.featured || false,
        rating: validatedData.rating || 4.5,
        reviews: validatedData.reviews || 0,
        isActive: true,
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Create primary image if provided
    if (validatedData.image) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: validatedData.image,
          isPrimary: true,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product data',
          details: error.errors,
        },
      });
    }

    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_PRODUCT_ERROR',
        message: 'Failed to create product',
      },
    });
    return;
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.nameEn && { nameEn: validatedData.nameEn }),
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.originalPrice !== undefined && { originalPrice: validatedData.originalPrice }),
        ...(validatedData.stockQuantity !== undefined && { stockQuantity: validatedData.stockQuantity }),
        ...(validatedData.categoryId && { categoryId: validatedData.categoryId }),
        ...(validatedData.image && { imageUrl: validatedData.image }),
        ...(validatedData.featured !== undefined && { featured: validatedData.featured }),
        ...(validatedData.rating !== undefined && { rating: validatedData.rating }),
        ...(validatedData.reviews !== undefined && { reviews: validatedData.reviews }),
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Update primary image if provided
    if (validatedData.image) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });

      await prisma.productImage.create({
        data: {
          productId: id,
          url: validatedData.image,
          isPrimary: true,
        },
      });
    }

    return res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product data',
          details: error.errors,
        },
      });
    }

    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PRODUCT_ERROR',
        message: 'Failed to update product',
      },
    });
    return;
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_PRODUCT_ERROR',
        message: 'Failed to delete product',
      },
    });
  }
};
