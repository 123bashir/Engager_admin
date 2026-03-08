import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import './Popup.css';

const Popup = ({ isOpen, type = 'success', message, onClose, onConfirm, showConfirm = false }) => {
    if (!isOpen) return null;

    useEffect(() => {
        if (!showConfirm) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose, showConfirm]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="popup-icon success" />;
            case 'error': return <FaTimesCircle className="popup-icon error" />;
            case 'warning': return <FaExclamationCircle className="popup-icon warning" />;
            default: return <FaCheckCircle className="popup-icon success" />;
        }
    };

    return (
        <div className="popup-overlay">
            <div className={`popup-content ${type}`}>
                <div className="popup-icon-wrapper">
                    {getIcon()}
                </div>
                <h3 className="popup-title">
                    {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Attention'}
                </h3>
                <p className="popup-message">{message}</p>

                {showConfirm ? (
                    <div className="popup-actions">
                        <button className="btn-popup-cancel" onClick={onClose}>Cancel</button>
                        <button className="btn-popup-confirm" onClick={onConfirm}>Confirm</button>
                    </div>
                ) : (
                    <button className="btn-popup-close" onClick={onClose}>Close</button>
                )}
            </div>
        </div>
    );
};

export default Popup;
