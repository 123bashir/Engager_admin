import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendar, FaBoxOpen } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { orderAPI, formatCurrency } from "../utils/api";
import Popup from "../Components/Popup";
import "./ViewProject.css"; // Keep the same CSS file name as requested but we'll use it for order layout

export default function ViewOrder({ onNavigate, activePage }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState({ isOpen: false, message: "", type: "success" });

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const result = await orderAPI.getById(id);
            if (result.success) {
                setOrder(result.order);
            } else {
                showPopup("Order not found", "error");
                setTimeout(() => navigate('/projects'), 2000);
            }
        } catch (error) {
            console.error("Failed to fetch order:", error);
            showPopup("Failed to load order details", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyStatus = async () => {
        try {
            const result = await orderAPI.verifyPayment(id);
            if (result.success) {
                showPopup(result.message, "success");
                fetchOrder(); // Reload data
            } else {
                showPopup(result.error || "Verification failed", "error");
            }
        } catch (error) {
            showPopup("Failed to contact server", "error");
        }
    };

    const showPopup = (message, type = "success") => {
        setPopup({ isOpen: true, message, type });
    };

    const closePopup = () => setPopup(prev => ({ ...prev, isOpen: false }));

    if (loading) {
        return (
            <div>
                <Sidebar onNavigate={onNavigate} activePage={activePage} />
                <div className="dashboard-main">
                    <Header />
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div>
                <Sidebar onNavigate={onNavigate} activePage={activePage} />
                <div className="dashboard-main">
                    <Header />
                    <div className="error-container">
                        <FaExclamationCircle size={50} color="#ef4444" />
                        <p>Order not found</p>
                        <button onClick={() => navigate('/projects')} className="btn-back">
                            <FaArrowLeft /> Back to Log
                        </button>
                    </div>
                </div>
                <Popup isOpen={popup.isOpen} message={popup.message} type={popup.type} onClose={closePopup} />
            </div>
        );
    }

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />
            <div className="dashboard-main">
                <Header />

                <main className="view-project-container">
                    <div className="project-header">
                        <button className="btn-back" onClick={() => navigate('/projects')}>
                            <FaArrowLeft /> Back to Orders
                        </button>
                        <div className="header-actions">
                            {order.payment_status !== 'Paid' && (
                                <button className="btn-edit" onClick={handleVerifyStatus} style={{ background: '#34A853' }}>
                                    <FiRefreshCw /> Verify Payment
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="project-title-section">
                        <h1>Order #ORD-{String(order.id).padStart(5, '0')}</h1>
                        <div className="project-meta">
                            <span className={`status-badge ${order.payment_status === 'Paid' ? 'status-completed' : 'status-pending'}`}>
                                {order.payment_status ? order.payment_status : 'Pending'}
                            </span>
                        </div>
                    </div>

                    <div className="project-details-grid">
                        {/* Customer Information */}
                        <div className="detail-card">
                            <h3><FaUser /> Customer Information</h3>
                            <div className="detail-row">
                                <span className="label">Name:</span>
                                <span className="value">{order.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label"><FaEnvelope /> Email:</span>
                                <span className="value">{order.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label"><FaMapMarkerAlt /> Address:</span>
                                <span className="value">{order.address || "N/A"}</span>
                            </div>
                        </div>

                        {/* Order Information */}
                        <div className="detail-card">
                            <h3><FaBoxOpen /> Order Details</h3>
                            <div className="detail-row">
                                <span className="label">Product:</span>
                                <span className="value">{order.product_name || 'NFC Product'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Amount:</span>
                                <span className="value">{formatCurrency(order.total_amount || order.product_price || 0)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label"><FaCalendar /> Date Created:</span>
                                <span className="value">{new Date(order.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Product Image */}
                        {order.product_image && (
                            <div className="detail-card">
                                <h3>Product Preview</h3>
                                <div className="order-product-img">
                                    <img
                                        src={`http://localhost:5000${order.product_image}`}
                                        alt={order.product_name}
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Order Metadata */}
                        <div className="detail-card">
                            <h3>Metadata</h3>
                            <div className="detail-row">
                                <span className="label">Payment Reference:</span>
                                <span className="value">{order.payment_reference || "N/A"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">System ID:</span>
                                <span className="value">{order.id}</span>
                            </div>
                        </div>
                    </div>
                </main>

                <div className="dashboard-footer">
                    <Footer />
                </div>
            </div>

            <Popup
                isOpen={popup.isOpen}
                message={popup.message}
                type={popup.type}
                onClose={closePopup}
            />
        </div>
    );
}
