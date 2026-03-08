import { useNavigate } from 'react-router-dom';
import './Notfound.css';

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="notfound-container">
            <div className="notfound-content">
                <div className="notfound-icon-wrapper">
                    <i className="bi bi-exclamation-triangle notfound-icon"></i>
                </div>

                <h1 className="notfound-title">404</h1>
                <h2 className="notfound-subtitle">Page Not Found</h2>
                <p className="notfound-text">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                <div className="notfound-actions">
                    <button onClick={handleGoHome} className="notfound-btn notfound-btn-primary">
                        <i className="bi bi-house-door"></i>
                        Go to Dashboard
                    </button>
                    <button onClick={handleGoBack} className="notfound-btn notfound-btn-secondary">
                        <i className="bi bi-arrow-left"></i>
                        Go Back
                    </button>
                </div>

                <div className="notfound-decoration">
                    <i className="bi bi-box-seam decoration-icon"></i>
                    <i className="bi bi-file-earmark-x decoration-icon"></i>
                    <i className="bi bi-search decoration-icon"></i>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
