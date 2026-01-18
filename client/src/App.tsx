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

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; show: boolean; type?: 'success' | 'error' | 'info' }>({
    message: '',
    show: false,
    type: 'success'
  });

  // Selected Sizes State: { [productId]: 'S' | 'M' | '42' }
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  // Category State
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Sort State
  const [sortOption, setSortOption] = useState<string>('');

  // Filter State
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Collapsible Sidebar State
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


  // 1. Fetch Categories
  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Kategoriler yüklenirken hata:", err));
  }, []);

  // 2. Fetch Products
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
        console.error("Hata:", err);
        setLoading(false);
      });
  }, [selectedCategory]);



  // 3. Client-side filters
  const filteredProducts = useMemo(() => {
    let result = products;

    if (showInStockOnly) {
      result = result.filter(p => p.variants && p.variants.some(v => v.stock > 0));
    }

    return result;
  }, [products, showInStockOnly]);

  // 4. Sort products
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
        // If already selected, deselect it (remove from state)
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      }
      // Otherwise select it
      return { ...prev, [productId]: size };
    });
  };

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id];

    if (!selectedSize) {
      setToast({
        message: 'Lütfen önce beden/numara seçiniz!',
        show: true,
        type: 'error'
      });
      return;
    }

    const variant = product.variants.find(v => v.size === selectedSize);
    if (!variant) return;

    // STOK KONTROLÜ (Client-side pre-check)
    const currentCartItem = cart.find(item => item.variantId === variant.id);
    const currentQty = currentCartItem ? currentCartItem.quantity : 0;

    if (currentQty + 1 > variant.stock) {
      setToast({
        message: `Stok yetersiz! (Mevcut: ${variant.stock})`,
        show: true,
        type: 'error'
      });
      return;
    }

    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => item.productName === product.name && item.size === selectedSize);
      if (existingItemIndex > -1) {
        const newCart = [...prev];
        // Create a new object for the updated item to avoid mutating the original state reference
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

    // Clear selected size after adding to cart
    setSelectedSizes(prev => {
      const newState = { ...prev };
      delete newState[product.id];
      return newState;
    });

    setToast({
      message: 'Ürün sepete eklendi!',
      show: true,
      type: 'success'
    });
    // setIsCartOpen(true); // İsteğe bağlı, ekleyince açılmasın
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

          // Stock validation (Client-side)
          // We need to find the product variant stock. 
          // Since we don't have the full product object here easily, 
          // we might rely on what we have or accept a small risk of desync, 
          // OR better: we look up the product in `products` list.
          // Wait, we don't stored productId in CartItem? We assume Name is unique or we should use variantId.
          // We stored variantId in CartItem! Perfect.

          // Find the product that owns this variant
          const productOwner = products.find(p => p.variants.some(v => v.id === item.variantId));
          const variant = productOwner?.variants.find(v => v.id === item.variantId);

          if (variant && newQuantity > variant.stock) {
            setToast({
              message: `Maksimum stok miktarına ulaştınız! (${variant.stock})`,
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
        {/* --- SIDEBAR --- */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('categories')}>
              <h3 className="sidebar-title">Kategoriler</h3>
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
                  Tümü
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
              <h3 className="sidebar-title">Sırala</h3>
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
                  Varsayılan
                </label>
                <label className={`sort-option ${sortOption === 'price-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-asc'}
                    onChange={() => handleSortSelect({ label: 'Artan Fiyat', value: 'price-asc' })}
                  />
                  En Düşük Fiyat
                </label>
                <label className={`sort-option ${sortOption === 'price-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'price-desc'}
                    onChange={() => handleSortSelect({ label: 'Azalan Fiyat', value: 'price-desc' })}
                  />
                  En Yüksek Fiyat
                </label>
                <label className={`sort-option ${sortOption === 'date-desc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-desc'}
                    onChange={() => handleSortSelect({ label: 'En Yeniler', value: 'date-desc' })}
                  />
                  En Yeniler
                </label>
                <label className={`sort-option ${sortOption === 'date-asc' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption === 'date-asc'}
                    onChange={() => handleSortSelect({ label: 'En Eskiler', value: 'date-asc' })}
                  />
                  En Eskiler
                </label>
              </div>
            )}
          </div>

          {/* FİLTRELER */}
          <div className="sidebar-section">
            <div className="sidebar-header" onClick={() => toggleSection('filter')}>
              <h3 className="sidebar-title">Filtrele</h3>
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
                  Sadece Stoktakiler
                </label>
              </div>
            )}
          </div>

        </aside>

        {/* --- CONTENT --- */}
        <main className="content">
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <div className="product-grid">
              {sortedProducts.length === 0 && (
                <div className="empty-state">
                  <p>Bu kategoride ürün bulunamadı{showInStockOnly ? ' (Stok filtresi aktif)' : ''}.</p>
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