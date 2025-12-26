# Algeria E-commerce Backend

Backend API for the Algeria E-commerce system with cash on delivery, authentication, and location-based services.

## Features

- 🗺️ Complete Algeria wilayas and baladiya system
- 💰 Cash on delivery payment support
- 🔐 Admin authentication with JWT
- 📦 Product catalog management
- 🛒 Order processing and tracking
- 🚚 Location-based delivery pricing

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database**
   ```bash
   npm run setup
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /health` - Server and database status

### Location System
- `GET /api/wilayas` - Get all Algeria wilayas
- `GET /api/wilayas/:id/baladiya` - Get baladiya for a wilaya

### Products (Coming Soon)
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders (Coming Soon)
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Admin (Coming Soon)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard data

## Database Schema

The system includes:
- **58 Algeria wilayas** with delivery costs
- **Major baladiya** for each wilaya
- **Product catalog** with categories
- **Order management** with cash on delivery
- **Admin system** with role-based access

## Default Admin User

- **Username:** admin
- **Password:** admin123
- **Email:** admin@algeria-ecommerce.com

⚠️ **Change the default password in production!**

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup` - Setup database and seed data
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and reseed database

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/algeria_ecommerce"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```