import { useEffect, useState, useMemo } from 'react';
import './App.css';
import Toast from './components/Toast';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import type { CartItem, Product } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; show: boolean; type?: 'success' | 'error' | 'info' }>({
    message: '',
    show: false,
    type: 'success'
  });

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [sortOption, setSortOption] = useState<string>('');

  const [showInStockOnly, setShowInStockOnly] = useState(false);

  const [openSections, setOpenSections] = useState({
    categories: true,
    sort: true,
    filter: true
  });

  const toggleSection = (section: 'categories' | 'sort' | 'filter') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:3000/products';
    if (selectedCategory) {
      url += `?category=${selectedCategory}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [selectedCategory]);



  const filteredProducts = useMemo(() => {
    let result = products;

    if (showInStockOnly) {
      result = result.filter(p => p.variants && p.variants.some(v => v.stock > 0));
    }

    return result;
  }, [products, showInStockOnly]);

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortOption === 'date-desc') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'date-asc') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return result;
  }, [filteredProducts, sortOption]);

  const handleCategorySelect = (category: string | null) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('');
    }
  };

  const handleSortSelect = (option: { label: string, value: string } | null) => {
    if (option) {
      setSortOption(option.value);
    } else {
      setSortOption('');
    }
  };

  const handleSizeSelect = (productId: number, size: string) => {
    setSelectedSizes(prev => {
      if (prev[productId] === size) {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      }
      return { ...prev, [productId]: size };
    });
  };

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id];

    if (!selectedSize) {
      setToast({
        message: 'Please select a size first!',
        show: true,
        type: 'error'
      });
      return;
    }

    const variant = product.variants.find(v => v.size === selectedSize);
    if (!variant) return;

    const currentCartItem = cart.find(item => item.variantId === variant.id);
    const currentQty = currentCartItem ? currentCartItem.quantity : 0;

    if (currentQty + 1 > variant.stock) {
      setToast({
        message: `Insufficient stock! (Available: ${variant.stock})`,
        show: true,
        type: 'error'
      });
      return;
    }

    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => item.productName === product.name && item.size === selectedSize);
      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      } else {
        return [...prev, {
          cartId: `${product.id}-${selectedSize}-${Date.now()}`,
          productName: product.name,
          price: product.basePrice,
          imageUrl: product.imageUrl,
          size: selectedSize,
          quantity: 1,
          variantId: variant.id,
          maxStock: variant.stock
        }];
      }
    });

    setSelectedSizes(prev => {
      const newState = { ...prev };
      delete newState[product.id];
      return newState;
    });

    setToast({
      message: 'Product added to cart!',
      show: true,
      type: 'success'
    });
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) {
          const newQuantity = item.quantity + delta;

          // Minimum quantity check
          if (newQuantity < 1) return item;

          const productOwner = products.find(p => p.variants.some(v => v.id === item.variantId));
          const variant = productOwner?.variants.find(v => v.id === item.variantId);

          if (variant && newQuantity > variant.stock) {
            setToast({
              message: `Maximum stock limit reached! (${variant.stock})`,
              show: true,
              type: 'error'
            });
            return item;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };


  return (
    <div className="container">
      {/* --- HEADER --- */}
      <header className="app-header">
        <div className="header-inner">
          <a href="/" className="logo-link">
            <h1 className="logo-text">Eldeniz's</h1>
          </a>

          <CartIcon
            itemCount={cart.reduce((a, b) => a + b.quantity, 0)}
            onClick={() => setIsCartOpen(true)}
          />
        </div>
      </header>

      {/* --- CART DRAWER --- */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* --- TOAST --- */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* --- MAIN LAYOUT --- */}
      <div className="main-layout">

        {/* --- SIDEBAR --- */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('categories')}>
              <h3 className="sidebar-title">Categories</h3>
              <span className={`chevron ${openSections.categories ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            {openSections.categories && (
              <ul className="category-list">
                <li
                  className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect('')}
                >
                  All
                </li>
                {categories.map(cat => (
                  <li
                    key={cat}
                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('sort')}>
              <h3 className="sidebar-title">Sort</h3>
              <span className={`chevron ${openSections.sort ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
            {openSections.sort && (
              <div className="sort-options">
                <label className={`sort-option ${sortOption === '' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === ''}
                    onChange={() => handleSortSelect(null)}
                  />
                  Default
                </label>
                <label className={`sort-option ${sortOption === 'price-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-asc'}
                    onChange={() => handleSortSelect({ label: 'Price Ascending', value: 'price-asc' })}
                  />
                  Price: Low to High
                </label>
                <label className={`sort-option ${sortOption === 'price-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-desc'}
                    onChange={() => handleSortSelect({ label: 'Price Descending', value: 'price-desc' })}
                  />
                  Price: High to Low
                </label>
                <label className={`sort-option ${sortOption === 'date-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-desc'}
                    onChange={() => handleSortSelect({ label: 'Newest', value: 'date-desc' })}
                  />
                  Newest Arrivals
                </label>
                <label className={`sort-option ${sortOption === 'date-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-asc'}
                    onChange={() => handleSortSelect({ label: 'Oldest', value: 'date-asc' })}
                  />
                  Oldest
                </label>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('filter')}>
              <h3 className="sidebar-title">Filter</h3>
              <span className={`chevron ${openSections.filter ? 'open' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
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

        {/* --- CONTENT --- */}
        <main className="content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="product-grid">
              {sortedProducts.length === 0 && (
                <div className="empty-state">
                  <p>No products found in this category{showInStockOnly ? ' (Stock filter active)' : ''}.</p>
                </div>
              )}

              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedSize={selectedSizes[product.id]}
                  showInStockOnly={showInStockOnly}
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