# E-Commerce Server

Node.js and Express backend for the E-Commerce application.

## Technologies Used
- **Node.js & Express**
- **TypeScript**
- **Prisma** (ORM with SQLite)
- **Swagger UI** (API Documentation)

## Features
- **RESTful API**: Endpoints for products and categories.
- **Database Integration**: SQLite database managed via Prisma.
- **API Documentation**: Interactive Swagger UI at `/api-docs`.
- **CORS Support**: Configured for secure frontend communication.

## How to Run

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`.
   
   **API Documentation**: Visit `http://localhost:3000/api-docs` to view and test API endpoints.
