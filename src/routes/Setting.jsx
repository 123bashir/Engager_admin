import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCog,
  FaUser,
  FaLock,
  FaSave,
  FaCamera,
  FaUserCircle,
  FaTimes,
  FaGlobe
} from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Loader from "../Components/Loader";
import { api, authAPI } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import "./Settings.css";

export default function Settings({ onNavigate, activePage }) {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    avatar_url: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [siteSettings, setSiteSettings] = useState({
    site_name: "",
    contact_email: "",
    phone: "",
    address: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: ""
  });

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setProfileData({
          name: response.user.name || "",
          email: response.user.email || "",
          phone: response.user.phone || "",
          department: response.user.department || "",
          position: response.user.position || "",
          avatar_url: response.user.avatar_url || ""
        });
        // Update context and session storage with full profile
        const updatedUser = { ...currentUser, ...response.user };
        updateUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const response = await api.get("/settings");
      if (response) {
        setSiteSettings({
          site_name: response.site_name || "",
          contact_email: response.contact_email || "",
          phone: response.phone || "",
          address: response.address || "",
          facebook: response.facebook || "",
          instagram: response.instagram || "",
          twitter: response.twitter || "",
          linkedin: response.linkedin || ""
        });
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      try {
        await fetchUserProfile();
        // Since currentUser might be stale in this closure, check it carefully
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user.role === 'super-admin') {
          await fetchSiteSettings();
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initFetch();
  }, []); // Only on mount

  // Sync profileData with currentUser if it changes from elsewhere
  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => {
        // Only update if data actually changed to avoid unnecessary re-renders
        if (prev.email === currentUser.email && prev.name === currentUser.name && prev.avatar_url === currentUser.avatar_url) {
          return prev;
        }
        return {
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
          department: currentUser.department || "",
          position: currentUser.position || "",
          avatar_url: currentUser.avatar_url || ""
        };
      });
    }
  }, [currentUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSiteSettingChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyError("Image size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const base64Image = await convertFileToBase64(file);
      const uploadResponse = await api.post("/upload/image", {
        image: base64Image,
        folder: "uploads/profiles"
      });

      if (uploadResponse.success && uploadResponse.imageUrl) {
        setProfileData(prev => ({ ...prev, avatar_url: uploadResponse.imageUrl }));
        notifySuccess("Profile photo uploaded successfully!");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileData(prev => ({ ...prev, avatar_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalProfileData = { ...profileData };

      // If avatar was changed and is base64, upload to Cloudinary first
      if (profileData.avatar_url && profileData.avatar_url.startsWith('data:')) {
        try {
          const uploadResponse = await api.post('/upload/image', {
            image: profileData.avatar_url,
            folder: 'greyinsaat/profiles'
          });

          if (uploadResponse.success) {
            finalProfileData.avatar_url = uploadResponse.imageUrl;
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setPopup({
            isOpen: true,
            type: 'error',
            message: 'Failed to upload profile image. Please try again.'
          });
          setSaving(false);
          return;
        }
      }

      // Update profile via API
      const response = await api.put(`/staff/${currentUser.id}`, finalProfileData);

      if (response.success) {
        // Update local session/context
        const updatedUser = { ...currentUser, ...finalProfileData };
        updateUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        notifySuccess('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSiteSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put("/settings", siteSettings);
      if (response.success) {
        notifySuccess('Site settings updated successfully!');
      }
    } catch (error) {
      console.error("Failed to update site settings:", error);
      // Auto-notified by api.js
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify("New passwords don't match!", 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      notify("Password must be at least 6 characters!", 'error');
      return;
    }

    setSaving(true);

    try {
      const response = await api.put(`/staff/${currentUser.id}`, { password: passwordData.newPassword });
      if (response.success) {
        notifySuccess('Password changed successfully!');
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Failed to change password:", error);
    } finally {
      setSaving(false);
    }
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <Sidebar onNavigate={onNavigate} activePage={activePage} />

      <div className="dashboard-main">
        <Header />

        <main className="settings-container">
          {/* Settings Header */}
          <div className="settings-header">
            <div className="header-content-settings">
              <h1>
                <FaCog />
                Settings
              </h1>
              <p>Manage your profile and security preferences</p>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="settings-tabs">
            <button
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser />
              Profile
            </button>
            <button
              className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <FaLock />
              Password
            </button>
            {currentUser?.role === 'super-admin' && (
              <button
                className={`tab-btn ${activeTab === "site" ? "active" : ""}`}
                onClick={() => setActiveTab("site")}
              >
                <FaGlobe />
                Site Settings
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="settings-panel">
                <h2 className="panel-title">
                  <FaUser />
                  Profile Information
                </h2>

                <form onSubmit={handleSaveProfile} className="settings-form">
                  {/* Avatar Section */}
                  <div className="avatar-section">
                    <div className="avatar-display">
                      {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Avatar" />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    <div className="avatar-upload">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        accept="image/*"
                      />
                      <button
                        type="button"
                        className="btn-upload-avatar"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        <FaCamera />
                        {uploadingImage ? "Uploading..." : "Upload Photo"}
                      </button>
                      {profileData.avatar_url && (
                        <button
                          type="button"
                          className="btn-remove-avatar"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                        >
                          <FaTimes />
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group-settings">
                      <label htmlFor="name">
                        <FaUser />
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group-settings">
                      <label htmlFor="email">
                        <FaUser />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        placeholder="your@email.com"
                        disabled
                      />
                    </div>

                    <div className="form-group-settings">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="+234 800 000 0000"
                      />
                    </div>

                    <div className="form-group-settings">
                      <label htmlFor="department">Department</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                        placeholder="e.g., Engineering"
                      />
                    </div>

                    <div className="form-group-settings">
                      <label htmlFor="position">Position</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={profileData.position}
                        onChange={handleProfileChange}
                        placeholder="e.g., Senior Engineer"
                      />
                    </div>
                  </div>

                  <div className="form-actions-settings">
                    <button type="submit" className="btn-save" disabled={saving}>
                      <FaSave />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="settings-panel">
                <h2 className="panel-title">
                  <FaLock />
                  Change Password
                </h2>

                <form onSubmit={handleChangePassword} className="settings-form">
                  <div className="form-group-settings">
                    <label htmlFor="newPassword">
                      <FaLock />
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group-settings">
                    <label htmlFor="confirmPassword">
                      <FaLock />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="form-actions-settings">
                    <button type="submit" className="btn-save" disabled={saving}>
                      <FaSave />
                      {saving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Site Settings Tab */}
            {activeTab === "site" && currentUser?.role === 'super-admin' && (
              <div className="settings-panel">
                <h2 className="panel-title">
                  <FaGlobe />
                  Site Global Settings
                </h2>

                <form onSubmit={handleSaveSiteSettings} className="settings-form">
                  <div className="form-grid">
                    <div className="form-group-settings">
                      <label htmlFor="site_name">Site Name</label>
                      <input
                        type="text"
                        id="site_name"
                        name="site_name"
                        value={siteSettings.site_name}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="form-group-settings">
                      <label htmlFor="contact_email">Contact Email</label>
                      <input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        value={siteSettings.contact_email}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="form-group-settings">
                      <label htmlFor="phone">Footer Phone</label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={siteSettings.phone}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="form-group-settings">
                      <label htmlFor="address">Footer Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={siteSettings.address}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                  </div>

                  <h3 style={{ marginTop: '20px', color: 'var(--accent-blue)' }}>Social Links</h3>
                  <div className="form-grid">
                    <div className="form-group-settings">
                      <label htmlFor="instagram">Instagram URL</label>
                      <input
                        type="text"
                        id="instagram"
                        name="instagram"
                        value={siteSettings.instagram}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="form-group-settings">
                      <label htmlFor="facebook">Facebook URL</label>
                      <input
                        type="text"
                        id="facebook"
                        name="facebook"
                        value={siteSettings.facebook}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="form-group-settings">
                      <label htmlFor="twitter">Twitter URL</label>
                      <input
                        type="text"
                        id="twitter"
                        name="twitter"
                        value={siteSettings.twitter}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                  </div>

                  <div className="form-actions-settings">
                    <button type="submit" className="btn-save" disabled={saving}>
                      <FaSave />
                      {saving ? "Saving Settings..." : "Update Global Settings"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>

        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}