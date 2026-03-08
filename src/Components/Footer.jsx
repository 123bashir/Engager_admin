import React from "react";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section footer-brand">
          <h3>Engager</h3>
          <p className="footer-tagline">Connecting the future with Smart NFC Solutions</p>
          <div className="footer-social">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaGithub />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="footer-section footer-contact">
          <h4>Contact Us</h4>
          <div className="footer-contact-items">
            <a href="mailto:info@engager.tech" className="footer-contact-item">
              <FaEnvelope />
              <span>info@engager.tech</span>
            </a>
            <a href="tel:+234 702 585 6080" className="footer-contact-item">
              <FaPhone />
              <span>+234 702 585 6080</span>
            </a>
            <div className="footer-contact-item">
              <FaMapMarkerAlt />
              <span>Kano, Nigeria</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section footer-links">
          <h4>Quick Links</h4>
          <ul className="footer-link-list">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/admin-products">Products</a></li>
            <li><a href="/projects">Transactions</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2026 <strong>Engager</strong>. All rights reserved.
        </p>
        <p className="footer-made-with">
          Made with <FaHeart className="heart-icon" /> by Engager Team
        </p>
        <span className="footer-version">v2.1.0</span>
      </div>
    </footer>
  );
}
