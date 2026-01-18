import React, { useState } from 'react';
import './ProductCard.css';

import type { Product } from '../types';

interface ProductCardProps {
    product: Product;
    selectedSize?: string;
    showInStockOnly: boolean;
    onSizeSelect: (productId: number, size: string) => void;
    onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, selectedSize, showInStockOnly, onSizeSelect, onAddToCart }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const variants = product.variants || [];
    const images = product.images && product.images.length > 0
        ? product.images.map(img => img.url)
        : [product.imageUrl];

    const hasMultipleImages = images.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Auto-select first image if out of bounds (safety)
    const displayImage = images[currentImageIndex] || images[0];

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://placehold.co/600x400?text=Resim+Yok";
                    }}
                />

                {hasMultipleImages && (
                    <>
                        <button className="slider-btn prev" onClick={prevImage}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button className="slider-btn next" onClick={nextImage}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                        <div className="slider-dots">
                            {images.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                ></span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="product-info">
                <div className="product-category">{product.brand || "Genel"}</div>
                <h3>{product.name}</h3>
                <p className="product-description">
                    {product.description}
                </p>

                {/* --- SIZE BADGES --- */}
                <div className="size-badges">
                    {variants.length > 0 ? variants.map(variant => {
                        const isSelected = selectedSize === variant.size;
                        const isOutOfStock = variant.stock === 0;

                        return (
                            <div
                                key={variant.id}
                                className={`size-badge ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                onClick={() => !isOutOfStock && onSizeSelect(product.id, variant.size)}
                                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                            >
                                {variant.size}
                                {isOutOfStock && <div className="cross-line"></div>}

                                {/* Hover Tooltip */}
                                <div className="hover-stock">
                                    {variant.stock} adet
                                </div>
                            </div>
                        );
                    }) : (
                        <span className="no-stock-alert">Stok Yok</span>
                    )}
                </div>

                <div className="product-price">
                    {product.basePrice} TL
                </div>

                <div className="card-actions">
                    {variants.every(v => v.stock === 0) ? (
                        <button className="out-stock-btn" disabled>Tükendi</button>
                    ) : (
                        <button className="add-btn" onClick={() => onAddToCart(product)} aria-label="Sepete Ekle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
