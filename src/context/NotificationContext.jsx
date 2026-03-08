import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import Popup from '../Components/Popup';
import { setNotifyCallback } from '../utils/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [popup, setPopup] = useState({
        isOpen: false,
        type: 'success',
        message: '',
        showConfirm: false,
        onConfirm: null
    });

    const notify = useCallback((message, type = 'success', options = {}) => {
        setPopup({
            isOpen: true,
            type,
            message,
            showConfirm: options.showConfirm || false,
            onConfirm: options.onConfirm || null
        });
    }, []);

    // Register callback for API errors
    useEffect(() => {
        setNotifyCallback((message) => {
            notify(message, 'error');
        });

        return () => setNotifyCallback(null);
    }, [notify]);

    const closePopup = useCallback(() => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    }, []);

    const notifyError = useCallback((message) => notify(message, 'error'), [notify]);
    const notifySuccess = useCallback((message) => notify(message, 'success'), [notify]);
    const notifyWarning = useCallback((message) => notify(message, 'warning'), [notify]);

    return (
        <NotificationContext.Provider value={{ notify, notifyError, notifySuccess, notifyWarning }}>
            {children}
            <Popup
                isOpen={popup.isOpen}
                type={popup.type}
                message={popup.message}
                onClose={closePopup}
                onConfirm={() => {
                    if (popup.onConfirm) popup.onConfirm();
                    closePopup();
                }}
                showConfirm={popup.showConfirm}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
