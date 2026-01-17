import { useEffect, useState, useMemo, useRef } from 'react';
import './App.css';
import Toast from './components/Toast';
import CartIcon from './components/CartIcon';
import CartDrawer from './components/CartDrawer';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  brand?: string;
  stockS: number;
  stockM: number;
  stockL: number;
  createdAt: string;
}

interface CartItem {
  cartId: string;
  productName: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
}

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

  // Selected Sizes State: { [productId]: 'S' | 'M' | 'L' }
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  // Category State
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Sort State
  const [sortOption, setSortOption] = useState(''); // 'price-asc', 'price-desc', 'date-asc', 'date-desc'

  // Stock Filter State
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  // Hardcoded Sort Options
  const sortOptions = [
    { label: 'Fiyat (Artan)', value: 'price-asc' },
    { label: 'Fiyat (Azalan)', value: 'price-desc' },
    { label: 'En Yeni', value: 'date-desc' },
    { label: 'En Eski', value: 'date-asc' },
  ];

  // Collapsible Sidebar State
  const [sections, setSections] = useState({
    categories: true,
    sort: false, // Default closed to emphasize collapsible nature
    filters: false // Default closed
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Fetch Categories on mount
  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then(res => res.json())
      .then(data => setCategories(data.sort())) // Sort alphabetically
      .catch(err => console.error("Kategori hatası:", err));
  }, []);

  // 2. Fetch Products (depends on selectedCategory)
  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:3000/products';
    if (selectedCategory) {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
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

  // Helper to get total stock
  const getTotalStock = (p: Product) => (p.stockS || 0) + (p.stockM || 0) + (p.stockL || 0);

  // 3. Client-side filters (Stock only now)
  const filteredProducts = useMemo(() => {
    let result = products;

    if (hideOutOfStock) {
      result = result.filter(p => getTotalStock(p) > 0);
    }

    return result;
  }, [products, hideOutOfStock]);

  // 4. Sort products
  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];
    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
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
        message: 'Lütfen önce beden seçiniz!',
        show: true,
        type: 'error'
      });
      return;
    }

    // Check Stock Limit
    // @ts-ignore
    const stockAvailable = product[`stock${selectedSize}`] as number;
    const existingItem = cart.find(item => item.productName === product.name && item.size === selectedSize);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > stockAvailable) {
      setToast({
        message: `Stok yetersiz! En fazla ${stockAvailable} adet alabilirsiniz.`,
        show: true,
        type: 'error'
      });
      return;
    }

    setCart(prev => {
      // Check if item with same product ID AND size exists
      const existingItemIndex = prev.findIndex(item => item.productName === product.name && item.size === selectedSize);
      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, {
          cartId: `${product.id}-${selectedSize}-${Date.now()}`,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          size: selectedSize,
          quantity: 1
        }];
      }
    });

    setToast({
      message: `${product.name} (${selectedSize}) sepete eklendi!`,
      show: true,
      type: 'success'
    });

    // Clear selected size after adding to cart
    setSelectedSizes(prev => {
      const newState = { ...prev };
      delete newState[product.id];
      return newState;
    });
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  return (
    <div className="container">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemove={handleRemoveFromCart}
      />

      <header className="app-header">
        <div className="header-inner">
          <a href="/" className="logo-link">
            <h1 className="logo-text">Eldeniz's</h1>
          </a>
          <div className="header-actions">
            <CartIcon
              itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
              onClick={() => setIsCartOpen(true)}
            />
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* --- SIDEBAR --- */}
        <aside className="sidebar">

          <div className="sidebar-section">
            <div
              className="sidebar-header"
              onClick={() => toggleSection('categories')}
            >
              <h3 className="sidebar-title">Kategoriler</h3>
              <svg
                className={`sidebar-arrow ${sections.categories ? 'open' : ''}`}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {sections.categories && (
              <ul className="category-list scrollable-list">
                <li
                  className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(null)}
                >
                  Tümü
                </li>
                {categories.map(cat => (
                  <li
                    key={cat}
                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sidebar-section">
            <div
              className="sidebar-header"
              onClick={() => toggleSection('sort')}
            >
              <h3 className="sidebar-title">Sıralama</h3>
              <svg
                className={`sidebar-arrow ${sections.sort ? 'open' : ''}`}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {sections.sort && (
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
                {sortOptions.map(opt => (
                  <label key={opt.value} className={`sort-option ${sortOption === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="sort"
                      checked={sortOption === opt.value}
                      onChange={() => handleSortSelect(opt)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div
              className="sidebar-header"
              onClick={() => toggleSection('filters')}
            >
              <h3 className="sidebar-title">Stok Durumu</h3>
              <svg
                className={`sidebar-arrow ${sections.filters ? 'open' : ''}`}
                xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {sections.filters && (
              <label className="checkbox-filter-sidebar">
                <input
                  type="checkbox"
                  checked={hideOutOfStock}
                  onChange={(e) => setHideOutOfStock(e.target.checked)}
                />
                Sadece Stoktakiler
              </label>
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
                  <p>Bu kategoride ürün bulunamadı.</p>
                </div>
              )}

              {sortedProducts.map((product) => {
                const totalStock = getTotalStock(product);
                const selectedSize = selectedSizes[product.id]; // Get selected size for this product

                return (
                  <div key={product.id} className="product-card">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://i.hizliresim.com/sis5d4y.jpg"
                      }}
                    />

                    <div className="product-info">
                      <div className="product-category">{product.brand || "Genel"}</div>
                      <h3>{product.name}</h3>
                      <p className="product-description">
                        {product.description}
                      </p>

                      {/* --- SIZE BADGES --- */}
                      <div className="size-badges">
                        {['S', 'M', 'L'].map(size => {
                          // @ts-ignore dynamic access
                          const stockVal = product[`stock${size}`] as number;
                          const hasStock = stockVal > 0;
                          const isSelected = selectedSize === size;

                          return (
                            <div
                              key={size}
                              className={`size-badge ${!hasStock ? 'out-of-stock' : ''} ${isSelected ? 'selected' : ''}`}
                              title={hasStock ? `${stockVal} adet` : 'Tükendi'}
                              onClick={() => hasStock && handleSizeSelect(product.id, size)}
                              style={{ cursor: hasStock ? 'pointer' : 'not-allowed' }}
                            >
                              {size}
                              {!hasStock && <div className="cross-line"></div>}
                              {hasStock && <span className="hover-stock">{stockVal} adet</span>}
                            </div>
                          )
                        })}
                      </div>

                      <div className="product-price">{product.price} TL</div>

                      {totalStock > 0 ? (
                        <button
                          className="add-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Sepete Ekle
                        </button>
                      ) : (
                        <button className="out-stock-btn" disabled>
                          Tükendi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;