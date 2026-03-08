import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCamera, FaTrash, FaPlus, FaCheckCircle, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Loader from "../Components/Loader";
import { useNotification } from "../context/NotificationContext";
import { productAPI, formatCurrency, getImageUrl } from "../utils/api";
import "./AddEditProject.css"; // Reuse existing styles for consistency

export default function AddEditProduct({ onNavigate, activePage }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const { notifySuccess, notifyError } = useNotification();

    const [formData, setFormData] = useState({
        name: "",
        tag: "New Arrival",
        description: "",
        price: "₦0",
        oldPrice: "₦0",
        image: "/product1.png",
        image_path: "/product1.png"
    });

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const result = await productAPI.getById(id);
            if (result) {
                setFormData({
                    name: result.name || "",
                    tag: result.tag || "New Arrival",
                    description: result.description || "",
                    price: result.price || "₦0",
                    oldPrice: result.oldPrice || "₦0",
                    image: result.image || "/product1.png",
                    image_path: result.image_path || "/product1.png"
                });
            }
        } catch (error) {
            notifyError('Failed to load product data.');
            setTimeout(() => navigate('/admin-products'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await productAPI.uploadImage(file);
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    image_path: result.imageUrl,
                    image: result.imageUrl
                }));
                notifySuccess('Image uploaded successfully!');
            }
        } catch (error) {
            notifyError('Failed to upload image. ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let result;
            if (isEditMode) {
                result = await productAPI.update(id, formData);
            } else {
                result = await productAPI.create(formData);
            }
            if (result.success) {
                notifySuccess(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
                setTimeout(() => navigate('/admin-products'), 1500);
            }
        } catch (error) {
            notifyError('Failed to save product. ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading product details...</p>
        </div>
    );

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />
            <div className="dashboard-main">
                <Header />
                <main className="add-edit-project-container">
                    <div className="form-header">
                        <div className="header-left">
                            <button className="btn-back" onClick={() => navigate('/admin-products')}>
                                <FaTimes /> Back to Products
                            </button>
                            <h1 className="form-title">
                                <FaPlus /> {isEditMode ? "Edit Product" : "Add New Product"}
                            </h1>
                            <p className="form-subtitle">
                                {isEditMode ? "Update product details for the store" : "Create a new NFC smart product"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="project-form">
                        <div className="form-section">
                            <h2 className="section-heading">Basic Information</h2>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label htmlFor="name">Product Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., NFC Business Card"
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label htmlFor="tag">Tag/Badge</label>
                                    <select id="tag" name="tag" value={formData.tag} onChange={handleChange}>
                                        <option value="New Arrival">New Arrival</option>
                                        <option value="Best Seller">Best Seller</option>
                                        <option value="Most Popular">Most Popular</option>
                                        <option value="Best Value">Best Value</option>
                                        <option value="Limited Edition">Limited Edition</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price (with ₦ symbol) *</label>
                                    <input
                                        type="text"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g., ₦29,000"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="oldPrice">Old Price (with ₦ symbol)</label>
                                    <input
                                        type="text"
                                        id="oldPrice"
                                        name="oldPrice"
                                        value={formData.oldPrice}
                                        onChange={handleChange}
                                        placeholder="e.g., ₦49,000"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-heading">Product Visuals</h2>
                            <div className="form-group">
                                <label>Product Image</label>
                                <div className="image-uploader-container" style={{
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }} onClick={() => fileInputRef.current.click()}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    {uploading ? (
                                        <div className="upload-loading">
                                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                            <p>Uploading to server...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt size={48} color="var(--accent-blue)" style={{ marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Click or Drag to Upload Image</p>
                                            <p style={{ fontSize: '0.85rem', color: '#888' }}>Supports PNG, JPG, WebP (Max 5MB)</p>
                                        </>
                                    )}
                                </div>

                                {formData.image_path && (
                                    <div className="image-preview-item" style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '10px' }}>Preview:</p>
                                        <img
                                            src={getImageUrl(formData.image_path)}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '250px',
                                                maxHeight: '250px',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '30px' }}>
                            <button type="button" className="btn-cancel" onClick={() => navigate('/admin-products')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={submitting || uploading}>
                                <FaCheckCircle /> {submitting ? "Saving..." : (isEditMode ? "Update Product" : "Create Product")}
                            </button>
                        </div>
                    </form>
                </main>
                <Footer />
            </div>
        </div>
    );
}
