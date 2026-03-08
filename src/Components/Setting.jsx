import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { currentUser } = useContext(AuthContext);
  const token = currentUser?.token;

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUserData(data.data);
          setFormData({
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            phone: data.data.phone || "",
            email:data.data.email || "",
            role:data.data.role||"",
            state: data.data.state || "",
            address: data.data.address || "",
          });
        }
      } catch (error) {
        setMessage({ type: "error", text: "❌ Error fetching user profile." });
      }
    };
    if (import.meta.env.VITE_ADMIN_TOKEN) fetchUser();
  }, [import.meta.env.VITE_ADMIN_TOKEN]);

  // Handle profile input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const rawBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email:formData.email,
        state: formData.state,
        role:formData.role,
        address: formData.address,
      };
      console.log(rawBody)
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawBody),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData(data.data);
        setMessage({ type: "success", text: "✅ Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.message || "❌ Failed to update profile.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Network error, please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const rawBody = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      };
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawBody),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
        setMessage({ type: "success", text: "✅ Password updated successfully!" });
      } else {
        let errorMsg = data.message || "❌ Failed to update password.";
        setMessage({ type: "error", text: errorMsg });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Network error, please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        User Settings
      </h2>

      {/* User Info Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <img
          src={"/malamMuntari.png"}
          alt="User"
          style={{
            borderRadius: "50%",
            marginRight: "20px",
            width: "100px",
            height: "100px",
          }}
        />
        <div style={{ flex: 1, minWidth: "250px" }}>
          <h3 style={{ margin: "0 0 5px", fontSize: "20px" }}>
            {userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."}
          </h3>
          <p style={{ margin: "0", color: "#666" }}>{userData?.email || "Loading..."}</p>
          <p style={{ margin: "0", color: "#666" }}>Role: {userData?.role || "N/A"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            background: activeTab === "profile" ? "#007bff" : "#f0f0f0",
            color: activeTab === "profile" ? "#fff" : "#333",
            transition: "0.3s",
          }}
        >
          Update Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            background: activeTab === "password" ? "#007bff" : "#f0f0f0",
            color: activeTab === "password" ? "#fff" : "#333",
            transition: "0.3s",
          }}
        >
          Reset Password
        </button>
      </div>

      {/* Forms */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {message && (
          <p
            style={{
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
              background: message.type === "success" ? "#d4edda" : "#f8d7da",
              color: message.type === "success" ? "#155724" : "#721c24",
            }}
          >
            {message.text}
          </p>
        )}

        {activeTab === "profile" && (
          <form
            onSubmit={handleUpdateProfile}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              style={inputStyle}
            />
              <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
                <input
              type="text"
              name="role"
              placeholder="Role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle}
            />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              style={inputStyle}
            />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        )}

        {activeTab === "password" && (
          <form
            onSubmit={handleResetPassword}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="password"
              name="current_password"
              placeholder="Current Password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              style={inputStyle}
            />
            <input
              type="password"
              name="new_password"
              placeholder="New Password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              style={inputStyle}
            />
            <input
              type="password"
              name="new_password_confirmation"
              placeholder="Confirm New Password"
              value={passwordData.new_password_confirmation}
              onChange={handlePasswordChange}
              style={inputStyle}
            />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const btnStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#007bff",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
  transition: "0.3s",
};
