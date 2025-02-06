import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/theme.css';
import logo from "../qatarUniLogo4.png";

const Navbar = ({ setCurrentView, userType = 'student' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <img src={logo} alt="Qatar University Logo" className="navbar-logo" />
            <h1 className="navbar-title">Qatar University PharmD Portal</h1>
            <ul className="navbar-links">
                <li>
                    <button className="button-primary" onClick={() => setCurrentView("dashboard")}>
                        Dashboard
                    </button>
                </li>
                <li>
                    <button className="button-primary" onClick={() => setCurrentView("choices")}>
                        {userType === 'student' ? 'Update Choices' : 'Update Availability'}
                    </button>
                </li>
                <li>
                    <button className="button-primary" onClick={() => setCurrentView("schedule")}>
                        View Schedule
                    </button>
                </li>
                {userType === 'admin' && (
                    <li>
                        <button className="button-primary" onClick={() => setCurrentView("create-user")}>
                            Create User
                        </button>
                    </li>
                )}
                <li>
                    <button className="button-secondary" onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;