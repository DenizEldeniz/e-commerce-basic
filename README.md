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
- **Vite** for fast development and building
- **Custom Hooks** for state management
- **CSS3** with modern styling and animations

### Backend
- **Express.js** with TypeScript
- **Prisma ORM** for database management
- **SQLite** database
- **Swagger/OpenAPI** for API documentation
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

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

# Copy environment variables
cp .env.example .env

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

## 🗂️ Project Structure

\`\`\`
e-commerce-basic/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types.ts       # TypeScript type definitions
│   │   ├── App.tsx        # Main application component
│   │   └── App.css        # Global styles
│   └── package.json
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── config/       # Configuration files (Swagger)
│   │   ├── types.ts      # TypeScript type definitions
│   │   └── index.ts      # Main server file
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
└── README.md
\`\`\`

## 🎨 Key Features Explained

### Product Variants
Each product can have multiple variants (sizes) with individual stock tracking:
- **Shoes**: Numeric sizes (e.g., 40, 41, 42)
- **Clothing**: Standard sizes (XS, S, M, L, XL)

### Shopping Cart
- Add products with selected size
- Update quantities (with stock validation)
- Remove items
- Visual stock limit indicators

### Image Management
- Multiple images per product
- Carousel/slider navigation
- Fallback for missing images

## 🔒 Environment Variables

### Backend (.env)
\`\`\`env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
NODE_ENV=development
\`\`\`

## 🧪 Database Schema

\`\`\`prisma
model Product {
  id          Int            @id @default(autoincrement())
  name        String
  basePrice   Float
  description String
  imageUrl    String
  category    String
  brand       String?
  createdAt   DateTime       @default(now())
  variants    Variant[]
  images      ProductImage[]
}

model Variant {
  id        Int     @id @default(autoincrement())
  productId Int
  size      String
  stock     Int
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductImage {
  id        Int     @id @default(autoincrement())
  productId Int
  url       String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
\`\`\`

## 🚧 Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Consistent naming conventions
- JSDoc comments for documentation

### Best Practices
- Custom hooks for reusable logic
- Proper error handling
- Input validation
- Responsive design
- Accessibility considerations

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Deniz Eldeniz**
- GitHub: [@DenizEldeniz](https://github.com/DenizEldeniz)

## 🙏 Acknowledgments

- Built as a technical interview project
- Demonstrates full-stack development skills
- Showcases modern web development practices
