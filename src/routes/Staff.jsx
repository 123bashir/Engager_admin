import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { staffAPI } from "../utils/api";
import {
    FaUserPlus,
    FaUsers,
    FaCheckCircle,
    FaShieldAlt,
    FaSearch,
    FaExclamationTriangle,
    FaHome,
    FaUserCircle,
    FaPencilAlt,
    FaTrash,
    FaUserTie
} from "react-icons/fa";
import Popup from "../Components/Popup";
import Loader from "../Components/Loader";
import { useNotification } from "../context/NotificationContext";
import "./Staff.css";

export default function Staff({ onNavigate, activePage }) {
    const navigate = useNavigate();
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const { notify, notifySuccess, notifyError } = useNotification();

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        // Filter staff based on search query
        if (searchQuery) {
            const filtered = staff.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.department?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStaff(filtered);
        } else {
            setFilteredStaff(staff);
        }
    }, [searchQuery, staff]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await staffAPI.getAll();

            if (result.success) {
                setStaff(result.staff);
                setFilteredStaff(result.staff);
            }
        } catch (err) {
            console.error("Failed to fetch staff:", err);
            setError("Failed to load staff. You may not have permission to view this page.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id, name) => {
        notify(`Are you sure you want to delete "${name}"? This action cannot be undone.`, 'warning', {
            showConfirm: true,
            onConfirm: () => handleDelete(id)
        });
    };

    const handleDelete = async (id) => {
        try {
            const result = await staffAPI.delete(id);
            if (result.success) {
                fetchStaff();
                notifySuccess('Staff member deleted successfully!');
            }
        } catch (err) {
            console.error("Failed to delete staff:", err);
            // Notification is handled automatically by api.js
        }
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, isOpen: false }));
    };

    const getRoleBadgeClass = (role) => {
        const roleMap = {
            'super-admin': 'role-superadmin',
            'admin': 'role-admin',
            'viewer': 'role-viewer'
        };
        return roleMap[role] || 'role-viewer';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <Loader />;

    return (
        <div>
            <Sidebar onNavigate={onNavigate} activePage={activePage} />

            <div className="dashboard-main">
                <Header />

                <main className="staff-container">
                    {/* Header Section */}
                    <div className="staff-header">
                        <div className="header-left">
                            <h1 className="page-title">Staff Management</h1>
                            <p className="page-subtitle">Manage system users and administrators</p>
                        </div>
                        <div className="header-right">
                            {currentUser?.role === 'super-admin' && (
                                <button
                                    className="btn-add-staff"
                                    onClick={() => navigate('/add-staff')}
                                >
                                    <FaUserPlus />
                                    Add New Staff
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="stats-cards">
                        <div className="stat-card total">
                            <div className="stat-icon">
                                <FaUsers />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{filteredStaff.length}</span>
                                <span className="stat-label">Total Staff</span>
                            </div>
                        </div>
                        <div className="stat-card active">
                            <div className="stat-icon">
                                <FaCheckCircle />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {filteredStaff.filter(s => s.is_active).length}
                                </span>
                                <span className="stat-label">Active</span>
                            </div>
                        </div>
                        <div className="stat-card admins">
                            <div className="stat-icon">
                                <FaShieldAlt />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {filteredStaff.filter(s => s.role !== 'viewer').length}
                                </span>
                                <span className="stat-label">Administrators</span>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="staff-controls">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search by name, email, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="error-container">
                            <FaExclamationTriangle size={50} color="#ef4444" />
                            <p>{error}</p>
                            <button onClick={() => navigate('/dashboard')} className="btn-retry">
                                <FaHome />
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                    {/* Staff Table */}
                    {!error && (
                        <div className="staff-table-container">
                            {filteredStaff.length === 0 ? (
                                <div className="empty-state">
                                    <FaUsers size={60} color="#cbd5e1" />
                                    <h3>No Staff Found</h3>
                                    <p>No staff members match your search criteria.</p>
                                </div>
                            ) : (
                                <table className="staff-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Department</th>
                                            <th>Position</th>
                                            <th>Status</th>
                                            <th>Last Login</th>
                                            {currentUser?.role === 'super-admin' && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map(member => (
                                            <tr key={member.id}>
                                                <td>
                                                    <div className="staff-name-cell">
                                                        <div className="staff-avatar">
                                                            {member.avatar_url ? (
                                                                <img src={member.avatar_url} alt={member.name} />
                                                            ) : (
                                                                <FaUserCircle />
                                                            )}
                                                        </div>
                                                        <span>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td>{member.email}</td>
                                                <td>
                                                    <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td>{member.department || 'N/A'}</td>
                                                <td>{member.position || 'N/A'}</td>
                                                <td>
                                                    <span className={`status-badge ${member.is_active ? 'status-active' : 'status-inactive'}`}>
                                                        {member.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>{formatDate(member.last_login)}</td>
                                                {currentUser?.role === 'super-admin' && (
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-action btn-edit"
                                                                onClick={() => navigate(`/edit-staff/${member.id}`)}
                                                                title="Edit"
                                                            >
                                                                <FaPencilAlt />
                                                            </button>
                                                            <button
                                                                className="btn-action btn-delete"
                                                                onClick={() => confirmDelete(member.id, member.name)}
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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
