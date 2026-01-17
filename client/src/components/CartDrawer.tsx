import React, { useEffect } from 'react';
import './Cart.css';

interface CartItem {
    cartId: string; // Unique ID for cart item (needed for same product different size)
    productName: string;
    price: number;
    imageUrl: string;
    size: string;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onRemove: (cartId: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cartItems, onRemove }) => {

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <>
            <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Sepetim ({cartItems.length})</h2>
                    <button className="close-cart-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-container">
                            <div className="empty-cart-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            </div>
                            <div className="empty-cart-title">Sepetim</div>
                            <div className="empty-cart-divider"></div>
                            <div className="empty-cart-message">Sepetinizde ürün bulunmamaktadır</div>

                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.cartId} className="cart-item">
                                <img src={item.imageUrl} alt={item.productName} className="cart-item-image" />
                                <div className="cart-item-info">
                                    <div className="cart-item-title">{item.productName}</div>
                                    <div className="cart-item-meta">
                                        <span className="cart-item-size">{item.size}</span>
                                        <span className="cart-item-price">{item.price} TL</span>
                                        <span>x {item.quantity}</span>
                                    </div>
                                </div>
                                <button
                                    className="remove-item-btn"
                                    onClick={() => onRemove(item.cartId)}
                                    title="Kaldır"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>Toplam</span>
                        <span>{total.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <button className="checkout-btn" disabled={cartItems.length === 0}>
                        Sepeti Onayla
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
