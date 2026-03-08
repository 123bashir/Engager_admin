import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaBell,
  FaUserCircle,
  FaChevronDown,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaHome,
  FaChevronRight
} from "react-icons/fa";
import Popup from "./Popup";
import "./Header.css";

export default function Header() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = currentUser || {};

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".header-user-menu")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const handleSignOutClick = () => {
    setDropdownOpen(false);
    setShowLogoutPopup(true);
  };

  const confirmSignOut = () => {
    sessionStorage.removeItem("user");
    updateUser(null);
    navigate("/");
  };

  // Get page title and breadcrumb based on route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Dashboard', bread: 'Home' };
    if (path === '/admin-products') return { title: 'Products', bread: 'Products' };
    if (path === '/add-product') return { title: 'Add Product', bread: 'New Product' };
    if (path.includes('/edit-product')) return { title: 'Edit Product', bread: 'Edit' };
    if (path === '/projects') return { title: 'Transactions', bread: 'Transactions' };
    if (path.includes('/viewProject')) return { title: 'Transaction Details', bread: 'View' };
    if (path === '/staff') return { title: 'Staff Management', bread: 'Staff' };
    if (path === '/email') return { title: 'Email', bread: 'Email' };
    if (path === '/settings') return { title: 'Settings', bread: 'Settings' };
    return { title: 'Engager', bread: 'Home' };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="modern-header">
      <Popup
        isOpen={showLogoutPopup}
        type="warning"
        message="Are you sure you want to sign out?"
        showConfirm={true}
        onClose={() => setShowLogoutPopup(false)}
        onConfirm={confirmSignOut}
      />

      <div className="header-container">
        {/* Left Section - Title & Breadcrumb */}
        <div className="header-left">
          <h1 className="header-page-title">{pageInfo.title}</h1>
          <div className="header-breadcrumb">
            <FaHome className="breadcrumb-icon" />
            <span className="breadcrumb-text">Engager</span>
            <FaChevronRight className="breadcrumb-separator" />
            <span className="breadcrumb-current">{pageInfo.bread}</span>
          </div>
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="header-right">
          {/* Notifications */}
          <button className="header-icon-btn" title="Notifications">
            <FaBell />
            <span className="notification-dot">3</span>
          </button>

          {/* User Menu */}
          <div
            className="header-user-menu"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="header-user-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{user.name || 'User'}</span>
              <span className="header-user-role">{user.role || 'viewer'}</span>
            </div>
            <FaChevronDown className={`header-dropdown-icon ${dropdownOpen ? 'open' : ''}`} />

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="header-dropdown-menu">
                <button
                  className="header-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/settings');
                    setDropdownOpen(false);
                  }}
                >
                  <FaUser />
                  <span>My Profile</span>
                </button>
                <button
                  className="header-dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/settings');
                    setDropdownOpen(false);
                  }}
                >
                  <FaCog />
                  <span>Settings</span>
                </button>
                <div className="header-dropdown-divider"></div>
                <button
                  className="header-dropdown-item logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOutClick();
                  }}
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
