import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

const TokenExpirationModal = ({ show, onClose }) => {
    const navigate = useNavigate();

    if (!show) return null;

    const handleSignIn = () => {
        localStorage.removeItem('access_token');
        navigate('/');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content token-expiration">
                <h3>Session Expired</h3>
                <p>Your session has expired. Please sign in again to continue.</p>
                <div className="modal-actions">
                    <button 
                        className="button-primary"
                        onClick={handleSignIn}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenExpirationModal; 