import { useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import Toast from './components/common/Toast';
import CartIcon from './components/common/CartIcon';
import CartDrawer from './components/cart/CartDrawer';
import Footer from './components/common/Footer';
import ProductCard from './components/product/ProductCard';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import apiService from './api/api';
import type { Product, ToastConfig } from './types';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastConfig>({
    message: '',
    show: false,
    type: 'success',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState({
    categories: true,
    sort: true,
    filter: true,
  });

  const { products, loading } = useProducts(selectedCategory);
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalItems } = useCart();

  useEffect(() => {
    apiService
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error loading categories:', err));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!showInStockOnly) return products;
    return products.filter((p) => p.variants && p.variants.some((v) => v.stock > 0));
  }, [products, showInStockOnly]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    switch (sortOption) {
      case 'price-asc':
        return result.sort((a, b) => a.basePrice - b.basePrice);
      case 'price-desc':
        return result.sort((a, b) => b.basePrice - a.basePrice);
      case 'date-desc':
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-asc':
        return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return result;
    }
  }, [filteredProducts, sortOption]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, show: true, type });
  }, []);

  const toggleSection = useCallback((section: 'categories' | 'sort' | 'filter') => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleSizeSelect = useCallback((productId: number, size: string) => {
    setSelectedSizes((prev) => {
      if (prev[productId] === size) {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      }
      return { ...prev, [productId]: size };
    });
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    const selectedSize = selectedSizes[product.id];
    const result = addToCart(product, selectedSize);

    showToast(result.message, result.success ? 'success' : 'error');

    if (result.success) {
      setSelectedSizes((prev) => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    }
  }, [selectedSizes, addToCart, showToast]);

  const handleUpdateQuantity = useCallback((cartId: string, delta: number) => {
    const result = updateQuantity(cartId, delta, products);
    if (!result.success) {
      showToast(result.message, 'error');
    }
  }, [updateQuantity, products, showToast]);

  return (
    <div className="container">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <a href="/" className="logo-link">
            <h1 className="logo-text">Eldeniz's</h1>
          </a>
          <CartIcon itemCount={getTotalItems()} onClick={() => setIsCartOpen(true)} />
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Categories Section */}
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('categories')}>
              <h3 className="sidebar-title">Categories</h3>
              <span className={`chevron ${openSections.categories ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            {openSections.categories && (
              <ul className="category-list">
                <li
                  className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat}
                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sort Section */}
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('sort')}>
              <h3 className="sidebar-title">Sort</h3>
              <span className={`chevron ${openSections.sort ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            {openSections.sort && (
              <div className="sort-options">
                <label className={`sort-option ${sortOption === '' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === ''}
                    onChange={() => setSortOption('')}
                  />
                  Default
                </label>
                <label className={`sort-option ${sortOption === 'price-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-asc'}
                    onChange={() => setSortOption('price-asc')}
                  />
                  Price: Low to High
                </label>
                <label className={`sort-option ${sortOption === 'price-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-desc'}
                    onChange={() => setSortOption('price-desc')}
                  />
                  Price: High to Low
                </label>
                <label className={`sort-option ${sortOption === 'date-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-desc'}
                    onChange={() => setSortOption('date-desc')}
                  />
                  Newest Arrivals
                </label>
                <label className={`sort-option ${sortOption === 'date-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-asc'}
                    onChange={() => setSortOption('date-asc')}
                  />
                  Oldest
                </label>
              </div>
            )}
          </div>

          {/* Filter Section */}
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('filter')}>
              <h3 className="sidebar-title">Filter</h3>
              <span className={`chevron ${openSections.filter ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </div>
            {openSections.filter && (
              <div className="filter-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                  />
                  In Stock Only
                </label>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="product-grid">
              {sortedProducts.length === 0 && (
                <div className="empty-state">
                  <p>
                    No products found in this category
                    {showInStockOnly ? ' (Stock filter active)' : ''}.
                  </p>
                </div>
              )}

              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedSize={selectedSizes[product.id]}
                  onSizeSelect={handleSizeSelect}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
