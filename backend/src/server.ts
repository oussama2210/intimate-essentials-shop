import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import locationRoutes from './routes/location';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import uploadRoutes from './routes/upload';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'Algeria E-commerce API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Algeria E-commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      locations: '/api/locations',
      wilayas: '/api/locations/wilayas',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Location routes
app.use('/api/locations', locationRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Legacy routes for backward compatibility
app.get('/api/wilayas', async (req, res) => {
  res.redirect(301, '/api/locations/wilayas');
});

app.get('/api/wilayas/:wilayaId/baladiya', async (req, res) => {
  res.redirect(301, `/api/locations/wilayas/${req.params.wilayaId}/baladiya`);
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Algeria E-commerce API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API docs: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;