# E-Commerce Frontend Client

A modern, responsive React application built with TypeScript and Vite, featuring a clean product browsing experience with real-time cart management and advanced filtering capabilities.

## 🛠️ Technology Stack

### Core Technologies
- **React 19**: Latest React with modern hooks and concurrent features
- **TypeScript**: Full type safety across the application
- **Vite**: Lightning-fast build tool and dev server
- **CSS3**: Custom vanilla CSS with modern features (Grid, Flexbox, Animations)

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Vite HMR**: Hot Module Replacement for instant updates

## 🏗️ Project Structure

```
src/
├── components/
│   ├── cart/
│   │   └── CartDrawer/        # Shopping cart slide-out drawer
│   ├── common/
│   │   ├── CartIcon/          # Cart icon with item count badge
│   │   ├── Footer/            # Application footer
│   │   └── Toast/             # Toast notification system
│   └── product/
│       └── ProductCard/       # Individual product display card
├── api/                       # API client and endpoints
├── hooks/                     # Custom React hooks
├── helpers/                   # Utility functions
├── constants/                 # App-wide constants
├── types.ts                   # TypeScript type definitions
├── App.tsx                    # Main application component
└── main.tsx                   # Application entry point
```

## ✨ Key Features

### Product Browsing
- **Dynamic Product Grid**: Responsive grid layout adapting to screen sizes
- **Image Carousel**: Multiple product images with smooth navigation
- **Category Filtering**: Filter products by category (Shoes, Clothing)
- **Brand Filtering**: Filter by product brands
- **Stock Filtering**: Toggle to show only in-stock items

### Sorting Options
- **Price Sorting**: Sort by price (Low to High, High to Low)
- **Date Sorting**: Sort by newest or oldest products
- **Default Sorting**: Original product order

### Shopping Cart
- **Real-time Updates**: Instant cart synchronization
- **Slide-out Drawer**: Smooth cart drawer animation
- **Size Selection**: Choose product size before adding to cart
- **Quantity Management**: Increment/decrement item quantities
- **Stock Validation**: Prevents adding more items than available stock
- **Auto-clear Size**: Selected size clears after adding to cart
- **Cart Badge**: Visual indicator showing total items in cart

### User Experience
- **Toast Notifications**: User feedback for all actions (add to cart, stock limits, etc.)
- **Responsive Design**: Mobile-first approach, works on all devices
- **Smooth Animations**: CSS transitions for drawer, hover effects, and interactions
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Graceful error messages for failed requests

## 🎨 UI/UX Highlights

- **Modern Aesthetic**: Clean, minimalist design with focus on products
- **Sticky Header**: Navigation stays accessible while scrolling
- **Hover Effects**: Interactive product cards with smooth transitions
- **Color Coding**: Visual indicators for stock status and actions
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔧 State Management

The application uses **React Hooks** for state management:
- `useState`: Local component state
- `useEffect`: Side effects and API calls
- Custom hooks for reusable logic

**No external state management library** - demonstrates clean React patterns with prop drilling and component composition.

## 📡 API Integration

The frontend communicates with the backend REST API:
- **Base URL**: Configured via environment variables
- **Endpoints**: Products, Categories
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Type Safety**: Full TypeScript types for API responses

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your backend API URL:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

The build output will be in the `dist/` directory.

## 🔧 Configuration

### Vite Config
- **Port**: 5173 (default)
- **Host**: 0.0.0.0 (accessible from network)
- **HMR**: Enabled for instant updates

### Environment Variables
- `VITE_API_URL`: Backend API base URL

## 📦 Component Architecture

### Component Organization
Components are organized by feature/domain:
- **cart/**: Cart-related components
- **common/**: Reusable UI components
- **product/**: Product-specific components

### Component Patterns
- **Functional Components**: All components use modern function syntax
- **TypeScript Props**: Strict typing for all component props
- **CSS Modules Pattern**: Scoped styles with naming conventions
- **Composition**: Small, focused components composed together

## 🎯 Technical Highlights

- ✅ **Full TypeScript**: 100% type coverage with strict mode
- ✅ **No UI Framework**: Custom CSS demonstrating vanilla styling skills
- ✅ **Modern React**: Latest React 19 features and patterns
- ✅ **Performance**: Optimized rendering with proper React patterns
- ✅ **Clean Code**: ESLint enforced code quality
- ✅ **Responsive**: Mobile-first CSS with breakpoints
- ✅ **Accessibility**: Semantic HTML and ARIA attributes

## 📝 Development Notes

This frontend was built with emphasis on:
- **Vanilla CSS Skills**: No Tailwind or CSS frameworks to showcase pure CSS abilities
- **React Best Practices**: Proper hooks usage, component composition, and state management
- **Type Safety**: Comprehensive TypeScript usage throughout
- **User Experience**: Smooth interactions, clear feedback, and intuitive interface
- **Code Organization**: Clean folder structure and separation of concerns
