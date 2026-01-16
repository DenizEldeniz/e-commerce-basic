import { useEffect, useState } from 'react';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Hangi kategorinin seçili olduğunu tutan durum (State)
  // Boş string ('') "Tümü" anlamına gelir.
  const [selectedCategory, setSelectedCategory] = useState('');

  // Kategori butonları için listemiz
  const categories = ["Tümü", "Giyim", "Elektronik", "Aksesuar"];

  useEffect(() => {
    // 1. URL'i hazırla
    let url = 'http://localhost:3000/products';

    // 2. Eğer bir kategori seçiliyse (ve "Tümü" değilse), URL'in sonuna ekle
    if (selectedCategory && selectedCategory !== "Tümü") {
      url += `?category=${selectedCategory}`;
    }

    setLoading(true);

    // 3. Veriyi çek
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

  }, [selectedCategory]); // [selectedCategory] demek: "Kategori değişirse bu kodu tekrar çalıştır" demektir.

  return (
    <div className="container">
      <h1>E-Ticaret Mağazası</h1>

      {/* --- FİLTRE BUTONLARI --- */}
      <div className="filter-container">
        {categories.map(cat => (
          <button
            key={cat}
            // Eğer seçili kategori bu butonsa, rengini mavi yap (active class'ı ekle)
            className={`filter-btn ${selectedCategory === cat || (cat === "Tümü" && selectedCategory === "") ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat === "Tümü" ? "" : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Yükleniyor...</p>
      ) : (
        <div className="product-grid">
          {products.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center" }}>
              <p>Bu kategoride ürün bulunamadı.</p>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                // Resim yüklenemezse yedek resim göster
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Resim+Yok"
                }}
              />

              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  {product.description}
                </p>
                <div className="product-price">{product.price} TL</div>
              </div>

              {product.stock > 0 ? (
                <button
                  className="add-btn"
                  onClick={() => alert(`${product.name} sepete eklendi!`)}
                >
                  Sepete Ekle
                </button>
              ) : (
                <button className="out-stock-btn" disabled>
                  Stokta Yok
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;