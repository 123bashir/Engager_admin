import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCamera, FaTrash } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { api, projectAPI, formatCurrency, projectTypes, projectStatuses } from "../utils/api";
import "./AddEditProject.css";

export default function AddEditProject({ onNavigate, activePage }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "Residential",
        status: "Planning",
        client: "",
        description: "",
        location: "",
        address: "",
        start_date: "",
        end_date: "",
        total_budget: "",
        spent_budget: 0,
        completion_percentage: 0,
        project_manager: "",
        team_members: "",
        images: []
    });

    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch project data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const result = await projectAPI.getById(id);

            if (result.success) {
                const project = result.project;
                setFormData({
                    name: project.name || "",
                    type: project.type || "Residential",
                    status: project.status || "Planning",
                    client: project.client || "",
                    description: project.description || "",
                    location: project.location || "",
                    address: project.address || "",
                    start_date: project.start_date || "",
                    end_date: project.end_date || "",
                    total_budget: project.total_budget || "",
                    spent_budget: project.spent_budget || 0,
                    completion_percentage: project.completion_percentage || 0,
                    project_manager: project.project_manager || "",
                    team_members: typeof project.team_members === 'string'
                        ? project.team_members
                        : (project.team_members || []).join(", "),
                    images: Array.isArray(project.images) ? project.images : (project.images ? [project.images] : [])
                });
            }
        } catch (error) {
            console.error("Failed to fetch project:", error);
            alert("Failed to load project data");
            navigate('/projects');
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
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 7) {
            alert('You can only upload up to 7 images');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Project name is required";
        if (!formData.client.trim()) newErrors.client = "Client name is required";


        // Check if end date is after start date
        if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            newErrors.end_date = "End date must be after start date";
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
            // Process images: upload new base64 images to backend
            const processedImages = await Promise.all(formData.images.map(async (img) => {
                if (img.startsWith('data:image/')) {
                    try {
                        const uploadResponse = await api.post('/upload/image', {
                            image: img,
                            folder: 'uploads/projects'
                        });

                        if (uploadResponse.success) {
                            return uploadResponse.imageUrl;
                        } else {
                            console.error("Failed to upload image:", uploadResponse.message);
                            return null;
                        }
                    } catch (uploadError) {
                        console.error("Image upload error:", uploadError);
                        return null;
                    }
                }
                return img; // Already a URL
            }));

            // Filter out any failed uploads (nulls)
            const finalImages = processedImages.filter(img => img !== null);

            const projectData = {
                name: formData.name,
                type: formData.type,
                status: formData.status,
                client: formData.client,
                description: formData.description,
                location: formData.location,
                address: formData.address,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_budget: parseFloat(formData.total_budget),
                spent_budget: parseFloat(formData.spent_budget),
                completion_percentage: parseInt(formData.completion_percentage),
                project_manager: formData.project_manager,
                team_members: formData.team_members,
                images: finalImages,
                milestones: [
                    { name: "Project Initiation", date: formData.start_date, completed: false },
                    { name: "Planning Phase", date: formData.start_date, completed: false },
                    { name: "Execution Phase", date: formData.start_date, completed: false },
                    { name: "Final Delivery", date: formData.end_date, completed: false }
                ]
            };

            let result;
            if (isEditMode) {
                result = await projectAPI.update(id, projectData);
            } else {
                result = await projectAPI.create(projectData);
            }

            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/projects');
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to save project:", error);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} project. Please try again.`);
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
                        <p>Loading project...</p>
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

                <main className="add-edit-project-container">
                    <div className="form-header">
                        <div className="header-left">
                            <button className="btn-back" onClick={() => navigate('/projects')}>
                                <i className="bi bi-arrow-left"></i>
                                Back to Projects
                            </button>
                            <h1 className="form-title">
                                <i className="bi bi-folder-plus"></i>
                                {isEditMode ? "Edit Project" : "Add New Project"}
                            </h1>
                            <p className="form-subtitle">
                                {isEditMode ? "Update project information" : "Create a new civil engineering project"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="project-form">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-info-circle"></i>
                                Basic Information
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Project Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={errors.name ? "error" : ""}
                                        placeholder="e.g., Luxury Villa Complex"
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="client">Client *</label>
                                    <input
                                        type="text"
                                        id="client"
                                        name="client"
                                        value={formData.client}
                                        onChange={handleChange}
                                        className={errors.client ? "error" : ""}
                                        placeholder="e.g., ABC Properties Ltd"
                                    />
                                    {errors.client && <span className="error-message">{errors.client}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="type">Project Type *</label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        {projectTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Status *</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {projectStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Detailed project description..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-geo-alt"></i>
                                Location Details
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="location">Location *</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={errors.location ? "error" : ""}
                                        placeholder="e.g., Guzape, Abuja"
                                    />
                                    {errors.location && <span className="error-message">{errors.location}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Full Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="e.g., Plot 245, Guzape District, Abuja FCT"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-calendar-range"></i>
                                Project Timeline
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="start_date">Start Date *</label>
                                    <input
                                        type="date"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className={errors.start_date ? "error" : ""}
                                    />
                                    {errors.start_date && <span className="error-message">{errors.start_date}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="end_date">End Date *</label>
                                    <input
                                        type="date"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className={errors.end_date ? "error" : ""}
                                    />
                                    {errors.end_date && <span className="error-message">{errors.end_date}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Budget Information */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-currency-exchange"></i>
                                Budget Information
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="total_budget">Total Budget (₦) *</label>
                                    <input
                                        type="number"
                                        id="total_budget"
                                        name="total_budget"
                                        value={formData.total_budget}
                                        onChange={handleChange}
                                        className={errors.total_budget ? "error" : ""}
                                        placeholder="e.g., 850000000"
                                        min="0"
                                    />
                                    {errors.total_budget && <span className="error-message">{errors.total_budget}</span>}
                                    <span className="input-hint">{formatCurrency(formData.total_budget)}</span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="spent_budget">Amount Spent (₦)</label>
                                    <input
                                        type="number"
                                        id="spent_budget"
                                        name="spent_budget"
                                        value={formData.spent_budget}
                                        onChange={handleChange}
                                        placeholder="e.g., 425000000"
                                        min="0"
                                    />
                                    <span className="input-hint">{formatCurrency(formData.spent_budget)}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="completion_percentage">Completion Percentage (%)</label>
                                <div className="range-container">
                                    <input
                                        type="range"
                                        id="completion_percentage"
                                        name="completion_percentage"
                                        value={formData.completion_percentage}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="range-slider"
                                    />
                                    <span className="range-value">{formData.completion_percentage}%</span>
                                </div>
                                <div className="progress-bar-preview">
                                    <div
                                        className="progress-fill-preview"
                                        style={{ width: `${formData.completion_percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Team Information */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-people"></i>
                                Team Information
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="project_manager">Project Manager *</label>
                                    <input
                                        type="text"
                                        id="project_manager"
                                        name="project_manager"
                                        value={formData.project_manager}
                                        onChange={handleChange}
                                        className={errors.project_manager ? "error" : ""}
                                        placeholder="e.g., Engr. Ibrahim Yusuf"
                                    />
                                    {errors.project_manager && <span className="error-message">{errors.project_manager}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="team_members">Team Members (comma- separated)</label>
                                    <input
                                        type="text"
                                        id="team_members"
                                        name="team_members"
                                        value={formData.team_members}
                                        onChange={handleChange}
                                        placeholder="e.g., Engr. Fatima Ahmed, Arch. Mohammed Hassan"
                                    />
                                    <span className="input-hint">Separate multiple names with commas</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Images */}
                        <div className="form-section">
                            <h2 className="section-heading">
                                <i className="bi bi-images"></i>
                                Project Images (Up to 7)
                            </h2>

                            <div className="form-group">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="btn-upload-images"
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={formData.images.length >= 7}
                                >
                                    <FaCamera />
                                    {formData.images.length === 0 ? 'Upload Images' : `Add More Images (${formData.images.length}/7)`}
                                </button>
                                <span className="input-hint">Upload up to 7 images from your PC</span>

                                {formData.images.length > 0 && (
                                    <div className="images-grid">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="image-preview-item">
                                                <img src={img} alt={`Project ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="btn-remove-image"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/projects')}
                                disabled={submitting}
                            >
                                <i className="bi bi-x-circle"></i>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={submitting}>
                                <i className="bi bi-check-circle"></i>
                                {submitting ? 'Saving...' : (isEditMode ? "Update Project" : "Create Project")}
                            </button>
                        </div>
                    </form>

                    {/* Success Modal */}
                    {showSuccess && (
                        <div className="success-overlay">
                            <div className="success-modal">
                                <i className="bi bi-check-circle-fill"></i>
                                <h2>{isEditMode ? "Project Updated!" : "Project Created!"}</h2>
                                <p>Redirecting to projects list...</p>
                            </div>
                        </div>
                    )}
                </main>

                <div className="dashboard-footer">
                    <Footer />
                </div>
            </div>
        </div>
    );
}
