import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { staffAPI, staffRoles, api } from "../utils/api";
import { FaImage, FaTimes, FaUpload } from "react-icons/fa";
import Loader from "../Components/Loader";
import { useNotification } from "../context/NotificationContext";
import "./AddEditStaff.css";

export default function AddEditStaff({ onNavigate, activePage }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const { notifySuccess, notifyError } = useNotification();
    const fileInputRef = useRef(null);

    // Check if current user is super-admin (you can get this from context or session)
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isSuperAdmin = currentUser.role === 'super-admin';

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "viewer",
        phone: "",
        department: "",
        position: "",
        avatar_url: "",
        is_active: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchStaff();
        }
    }, [id]);

    const fetchStaff = async () => {
        try {
            const result = await staffAPI.getById(id);

            if (result.success) {
                const staff = result.staff;
                setFormData({
                    name: staff.name || "",
                    email: staff.email || "",
                    password: "",
                    confirmPassword: "",
                    role: staff.role || "viewer",
                    phone: staff.phone || "",
                    department: staff.department || "",
                    position: staff.position || "",
                    avatar_url: staff.avatar_url || "",
                    is_active: staff.is_active !== undefined ? staff.is_active : true
                });
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            // Auto-notified by api.js
            navigate('/staff');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            notifyError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            notifyError('Image size must be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Image = reader.result;

                    // Upload to Backend (Local Storage)
                    const uploadResponse = await api.post('/upload/image', {
                        image: base64Image,
                        folder: 'uploads/profiles'
                    });

                    if (uploadResponse.success) {
                        setFormData(prev => ({
                            ...prev,
                            avatar_url: uploadResponse.imageUrl
                        }));
                        notifySuccess('Profile image uploaded successfully!');
                    }
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                } finally {
                    setUploadingImage(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            };
            reader.onerror = () => {
                notifyError('Failed to read image file');
                setUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image upload error:', error);
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            avatar_url: ""
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!isEditMode) {
            if (!formData.password) newErrors.password = "Password is required";
            if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const staffData = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                phone: formData.phone,
                department: formData.department,
                position: formData.position,
                avatar_url: formData.avatar_url,
                is_active: formData.is_active
            };

            // Only include password if it's set
            if (formData.password) {
                staffData.password = formData.password;
            }

            let result;
            if (isEditMode) {
                result = await staffAPI.update(id, staffData);
            } else {
                result = await staffAPI.create(staffData);
            }

            if (result.success) {
                notifySuccess(`Staff member ${isEditMode ? 'updated' : 'created'} successfully!`);
                setTimeout(() => {
                    navigate('/staff');
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to save staff:", error);
            // Auto-notified by api.js
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Sidebar onNavigate={onNavigate} activePage={activePage} />
                <div className="dashboard-main">
                    <Header />
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading staff data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />
            <div className="dashboard-main">
                <Header />

                <main className="add-edit-staff-container">
                    <div className="form-header">
                        <button className="btn-back" onClick={() => navigate('/staff')}>
                            <i className="bi bi-arrow-left"></i>
                            Back to Staff
                        </button>
                        <h1 className="form-title">
                            <i className="bi bi-person-plus"></i>
                            {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
                        </h1>
                        <p className="form-subtitle">
                            {isEditMode ? "Update staff member information" : "Create a new staff account"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="staff-form">
                        {/* Personal Information */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-person"></i>
                                Personal Information
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={errors.name ? "error" : ""}
                                        placeholder="e.g., John Doe"
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? "error" : ""}
                                        placeholder="e.g., john@greyinsaat.com"
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g., +234 8012345678"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="avatar">Profile Image</label>
                                    <div className="image-upload-container">
                                        <input
                                            type="file"
                                            id="avatar"
                                            name="avatar"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                            disabled={uploadingImage}
                                        />

                                        {formData.avatar_url ? (
                                            <div className="image-preview-container">
                                                <div className="image-preview">
                                                    <img src={formData.avatar_url} alt="Profile" />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-image"
                                                        onClick={removeImage}
                                                        title="Remove image"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-change-image"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingImage}
                                                >
                                                    <FaUpload />
                                                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn-upload-image"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingImage}
                                            >
                                                <FaImage />
                                                {uploadingImage ? 'Uploading...' : 'Upload Profile Image'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-shield-lock"></i>
                                Security
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">
                                        Password {isEditMode ? "(Leave blank to keep current)" : "*"}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? "error" : ""}
                                        placeholder="Enter password"
                                    />
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? "error" : ""}
                                        placeholder="Confirm password"
                                    />
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-briefcase"></i>
                                Work Information
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="department">Department</label>
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="e.g., Engineering"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="position">Position</label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleChange}
                                        placeholder="e.g., Senior Engineer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role & Status (Super Admin Only) */}
                        {isSuperAdmin && (
                            <div className="form-section">
                                <h2 className="section-heading">
                                    <i className="bi bi-shield-check"></i>
                                    Role & Status
                                </h2>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="role">Role *</label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            {staffRoles.map(role => (
                                                <option key={role} value={role}>
                                                    {role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="input-hint">
                                            Super-admin: Full access | Admin: Manage projects | Viewer: Read-only
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                            />
                                            <span>Active Account</span>
                                        </label>
                                        <span className="input-hint">
                                            Inactive accounts cannot login
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/staff')}
                                disabled={submitting}
                            >
                                <i className="bi bi-x-circle"></i>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={submitting}>
                                <i className="bi bi-check-circle"></i>
                                {submitting ? 'Saving...' : (isEditMode ? "Update Staff" : "Create Staff")}
                            </button>
                        </div>
                    </form>
                </main>

                <div className="dashboard-footer">
                    <Footer />
                </div>
            </div>
        </div>
    );
}
