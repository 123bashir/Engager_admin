import React from 'react';
import { FaSpinner, FaBolt } from 'react-icons/fa';
import './Loader.css';

const Loader = () => {
    return (
        <div className="modern-loader-container">
            <div className="loader-content">
                <div className="icon-wrapper">
                    <FaBolt className="static-icon" style={{ color: '#00bcd4' }} />
                    <FaSpinner className="spinning-icon" />
                </div>
                <h3 className="loader-text">Engager</h3>
                <p className="loader-subtext">Connecting the future...</p>
            </div>
        </div>
    );
};

export default Loader;
