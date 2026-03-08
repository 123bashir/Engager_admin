import React, { useState, useContext, useEffect } from "react";
import {
  FaTachometerAlt,
  FaProjectDiagram,
  FaPlus,
  FaUsers,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBoxOpen,
  FaExchangeAlt,
  FaBolt
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Popup from "./Popup";
import "./Sidebar.css";

export default function Sidebar({ onNavigate, activePage }) {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const user = currentUser || {};
  const isSuperAdmin = user.role === 'super-admin';

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClick = (e) => {
      if (
        sidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".hamburger-btn")
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sidebarOpen]);

  const handleSignOutClick = () => {
    setShowLogoutPopup(true);
  };

  const confirmSignOut = () => {
    sessionStorage.removeItem("user");
    updateUser(null);
    setTimeout(() => navigate("/"), 300);
  };

  const menuItems = [
    { icon: FaTachometerAlt, label: "Dashboard", path: "/dashboard", page: "dashboard" },
    { icon: FaBoxOpen, label: "Product", path: "/admin-products", page: "admin-products" },
    { icon: FaPlus, label: "Add Product", path: "/add-product", page: "add-product" },
    { icon: FaExchangeAlt, label: "Transactions", path: "/projects", page: "projects" },
    { icon: FaUsers, label: "Staff", path: "/staff", page: "staff", adminOnly: true },
    { icon: FaEnvelope, label: "Email", path: "/email", page: "email" },
    { icon: FaCog, label: "Settings", path: "/settings", page: "settings" },
  ];

  return (
    <>
      <Popup
        isOpen={showLogoutPopup}
        type="warning"
        message="Are you sure you want to sign out?"
        showConfirm={true}
        onClose={() => setShowLogoutPopup(false)}
        onConfirm={confirmSignOut}
      />

      {/* Mobile Hamburger Button */}
      {!sidebarOpen && (
        <button
          className="hamburger-btn"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Close Button (Mobile) */}
        <button
          className="close-sidebar-btn"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        {/* Logo & Branding */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <FaBolt style={{ color: '#00bcd4' }} />
          </div>
          <div className="brand-text">
            <h2>Engager</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar-circle">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              <FaUserCircle />
            )}
          </div>
          <div className="user-details">
            <h3>{user.name || 'User'}</h3>
            <span className={`user-role-badge role-${user.role}`}>
              {user.role?.replace('-', ' ') || 'Viewer'}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            // Hide admin-only items for non-super-admins
            if (item.adminOnly && !isSuperAdmin) return null;

            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${activePage === item.page ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {item.adminOnly && <span className="admin-badge">Admin</span>}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button className="nav-item logout-item" onClick={handleSignOutClick}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-label">Sign Out</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer-info">
          <p>© 2025 Engager Ltd</p>
          <span className="version-tag">v2.1.0</span>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
