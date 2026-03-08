import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import { useNotification } from "../context/NotificationContext";
import "./loginModern.css";

function Login() {
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);

      if (data.success) {
        notifySuccess(data.message || "Login successful!");
        const userToSave = { ...data.user, token: data.token };
        sessionStorage.setItem('user', JSON.stringify(userToSave));
        updateUser(userToSave);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      // Auto-notified by api.js
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Image section on right in desktop */}
      <div className="login-image-section">
        <img src="/logo.png" alt="Engager Admin" style={{ width: '200px', marginBottom: '20px' }} />
        <div className="login-info">
          <h2 style={{ color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Engager Smart Solutions</h2>
          <p style={{ color: "#fff", fontWeight: "600", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>Smart NFC Business solutions for modern professionals.</p>

          <div style={{ marginTop: "2rem" }}>


          </div>
        </div>
      </div>
      {/* Form section on left in desktop */}
      <div className="login-form-section">
        <div className="login-form-box">
          <h1> Engager Admin Portal</h1>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>

            <div>Enter your Admin Email and password</div>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
