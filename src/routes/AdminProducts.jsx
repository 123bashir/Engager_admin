import React, { useState, useEffect } from "react";
import { FaBoxOpen, FaPlus, FaEye, FaPencilAlt, FaTrash, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Popup from "../Components/Popup";
import { useNotification } from "../context/NotificationContext";
import { productAPI, formatCurrency, getImageUrl } from "../utils/api";
import "./Projects.css";

export default function AdminProducts({ onNavigate, activePage }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { notify, notifySuccess, notifyError } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getAll();
            // Handle both array and object responses for backward compatibility
            setProducts(Array.isArray(data) ? data : (data.products || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        notify('Are you sure you want to delete this product?', 'warning', {
            showConfirm: true,
            onConfirm: async () => {
                try {
                    const result = await productAPI.delete(id);
                    if (result.success) {
                        notifySuccess('Product deleted successfully!');
                        fetchProducts();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />
            <div className="dashboard-main">
                <Header />
                <main className="projects-container">
                    <div className="projects-header">
                        <div className="header-left">
                            <h1 className="page-title">Product Management</h1>
                            <p className="page-subtitle">Manage your Engager NFC smart devices</p>
                        </div>
                        <div className="header-right">
                            <button className="btn-add-project" onClick={() => navigate('/add-product')}>
                                <FaPlus /> Add New Product
                            </button>
                        </div>
                    </div>

                    <div className="projects-controls">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <div className="projects-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="project-card">
                                    <div className="project-image">
                                        <img src={getImageUrl(product.image_path || product.image)} alt={product.name} />
                                        <span className="status-badge status-progress">
                                            {product.tag || 'Active'}
                                        </span>
                                    </div>
                                    <div className="project-content">
                                        <div className="project-header">
                                            <h3 className="project-name">{product.name}</h3>
                                            <span className="project-type">{product.price}</span>
                                        </div>
                                        <p className="project-description" style={{ fontSize: '0.9rem', color: '#666', margin: '10px 0' }}>
                                            {product.description.substring(0, 100)}...
                                        </p>
                                        <div className="project-stats" style={{ display: 'flex', gap: '20px', margin: '15px 0' }}>
                                            <div className="stat">
                                                <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Views</span>
                                                <span className="value" style={{ fontWeight: 'bold' }}>{product.clicks || 0}</span>
                                            </div>
                                        </div>
                                        <div className="project-actions">
                                            <button className="btn-action btn-edit" onClick={() => navigate(`/edit-product/${product.id}`)}>
                                                <FaPencilAlt /> Edit
                                            </button>
                                            <button className="btn-action btn-delete" onClick={() => handleDelete(product.id)}>
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </div>
    );
}
