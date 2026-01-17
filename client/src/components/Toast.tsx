import { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHiding(true);
            // Wait for animation to finish before calling onClose
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast-container`}>
            <div className={`toast ${type} ${isHiding ? 'hiding' : ''}`}>
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={() => {
                    setIsHiding(true);
                    setTimeout(onClose, 300);
                }}>
                    &times;
                </button>
            </div>
        </div>
    );
};

export default Toast;
