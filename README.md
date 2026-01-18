# E-Commerce Platform

A modern, full-stack e-commerce application built with React, TypeScript, Express, and Prisma. Features a clean UI for browsing products, managing shopping cart, and filtering by categories.

## 🚀 Features

- **Product Catalog**: Browse products with multiple images, variants (sizes), and detailed information
- **Category Filtering**: Filter products by category (Shoes, Clothing)
- **Advanced Sorting**: Sort by price (ascending/descending) or date (newest/oldest)
- **Stock Management**: Real-time stock tracking with size-specific inventory
- **Shopping Cart**: Add, remove, and update quantities with stock validation
- **Responsive Design**: Modern, mobile-friendly UI with smooth animations
- **Image Carousel**: Multiple product images with slider navigation
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **CSS3**

### Backend
- **Express.js** with TypeScript
- **Prisma ORM** for database management
- **SQLite** database
- **Swagger/OpenAPI** for API documentation
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm

## 🔧 Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/DenizEldeniz/e-commerce-basic.git
cd e-commerce-basic
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd server
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd ../client
npm install
\`\`\`

## 🚀 Running the Application

### Start the Backend Server

\`\`\`bash
cd server
npm run dev
\`\`\`

The server will start at `http://localhost:3000`

### Start the Frontend

\`\`\`bash
cd client
npm run dev
\`\`\`

The application will open at `http://localhost:5173`

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:3000/api-docs`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (with optional category filter) |
| GET | `/products/:id` | Get a single product by ID |
| POST | `/products` | Create a new product with variants |
| GET | `/categories` | Get all available categories |

### Example: Create Product

\`\`\`json
POST /products
{
  "name": "Running Shoes",
  "basePrice": 299.99,
  "description": "Comfortable running shoes",
  "category": "shoes",
  "brand": "Nike",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "variants": [
    { "size": "40", "stock": 10 },
    { "size": "41", "stock": 5 },
    { "size": "42", "stock": 8 }
  ]
}
\`\`\`

## 🔒 Environment Variables

### Backend (.env)
\`\`\`env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=development
\`\`\`


## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Deniz Eldeniz**
- GitHub: [@DenizEldeniz](https://github.com/DenizEldeniz)

