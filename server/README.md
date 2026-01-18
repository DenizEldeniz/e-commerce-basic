# E-Commerce Backend Server

A robust Node.js backend API built with Express and TypeScript, featuring a product-variant architecture for managing e-commerce products with multiple sizes and stock levels.

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: SQLite
- **ORM**: Prisma 5.x

### Key Dependencies
- **CORS**: Cross-origin resource sharing configuration
- **Swagger**: API documentation with `swagger-jsdoc` and `swagger-ui-express`
- **dotenv**: Environment variable management
- **ts-node**: TypeScript execution for development
- **nodemon**: Hot-reload development server

## 🏗️ Architecture Overview

This backend follows a **layered architecture** pattern with clear separation of concerns:

```
src/
├── config/          # Configuration files (database, CORS, Swagger)
├── controllers/     # Request handlers and business logic
├── middleware/      # Custom middleware (error handling, validation)
├── routes/          # API route definitions
├── services/        # Business logic layer
├── validators/      # Request validation schemas
└── types.ts         # TypeScript type definitions
```

### Design Patterns
- **MVC Pattern**: Separation of routes, controllers, and services
- **Product-Variant Model**: Relational architecture for products with multiple sizes/variants
- **RESTful API**: Standard HTTP methods and status codes
- **Error Handling Middleware**: Centralized error management

## 📊 Database Schema

The database uses a **relational model** with three main entities:

### Product Model
- Stores base product information (name, price, brand, category)
- Supports multiple images per product
- Related to variants for size/stock management

### Variant Model
- Manages size-specific inventory (S, M, L, 42, 43, etc.)
- Each variant has independent stock tracking
- Cascade delete when parent product is removed

### ProductImage Model
- Supports multiple images per product
- Enables image carousel functionality
- Cascade delete with parent product

**Key Schema Features**:
- ✅ One-to-Many relationships (Product → Variants, Product → Images)
- ✅ Cascade deletion for data integrity
- ✅ Auto-incrementing IDs
- ✅ Timestamp tracking with `createdAt`

## 🔌 API Endpoints

### Products
- `GET /products` - Fetch all products with optional category filter
- `GET /products/:id` - Get single product by ID with variants and images
- `POST /products` - Create new product with variants and images

### Categories
- `GET /categories` - List all available categories

### Documentation
- `GET /api-docs` - Interactive Swagger UI for testing endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your settings (PORT, DATABASE_URL, etc.)

4. **Initialize database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

Once the server is running, visit **`http://localhost:3000/api-docs`** to access the interactive Swagger documentation where you can:
- View all available endpoints
- Test API requests directly in the browser
- See request/response schemas
- Understand query parameters and filters

## 🔧 Configuration

### CORS Settings
Configured to allow requests from the frontend application. Modify `src/config/cors.ts` to adjust allowed origins.

### Database
SQLite database file located at `prisma/dev.db`. For production, consider migrating to PostgreSQL or MySQL by updating the Prisma schema.

### Environment Variables
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: Database connection string
- Additional variables in `.env.example`

## 🎯 Key Features

- ✅ **Type-Safe**: Full TypeScript implementation with strict typing
- ✅ **Validated Requests**: Input validation for all endpoints
- ✅ **Error Handling**: Comprehensive error middleware with proper HTTP status codes
- ✅ **API Documentation**: Auto-generated Swagger docs from JSDoc comments
- ✅ **Relational Data**: Proper foreign key relationships and cascade operations
- ✅ **Stock Management**: Variant-level inventory tracking
- ✅ **Multi-Image Support**: Product image carousel functionality

## 📝 Development Notes

This backend was built with a focus on:
- **Clean Architecture**: Separation of concerns with controllers, services, and routes
- **Scalability**: Product-variant model allows easy expansion to new categories
- **Developer Experience**: Swagger docs and TypeScript for better DX
- **Data Integrity**: Prisma ORM with proper relations and cascade rules
