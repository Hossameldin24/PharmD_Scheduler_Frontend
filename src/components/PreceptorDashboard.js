import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar.js";
import "../styles/theme.css";
import PerceptorAvailabilityForm from "./PerceptorAvailabilityForm.js";
import ViewPreceptorSchedule from "./ViewPreceptorSchedule.js";
import PreceptorEvaluationForm from "./PreceptorEvaluationForm.js";
import axiosInstance from '../utils/axiosConfig';
import TokenExpirationModal from './TokenExpirationModal';

const PreceptorDashboard = () => {
    const [preceptorData, setPreceptorData] = useState(null);
    const [error, setError] = useState("");
    const [currentView, setCurrentView] = useState("dashboard");
    const [showTokenModal, setShowTokenModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleTokenExpiration = () => {
            setShowTokenModal(true);
        };

        window.addEventListener('tokenExpired', handleTokenExpiration);
        return () => window.removeEventListener('tokenExpired', handleTokenExpiration);
    }, []);

    useEffect(() => {
        const fetchPreceptorData = async () => {
            try {
                const response = await axiosInstance.get("/auth/preceptor/dashboard");
                setPreceptorData(response.data.data);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    setShowTokenModal(true);
                } else {
                    setError("Failed to fetch preceptor data. Please try again later.");
                }
            }
        };

        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/");
            return;
        }

        fetchPreceptorData();
    }, [navigate]);

    const renderContent = () => {
        switch (currentView) {
            case "availability":
                return <PerceptorAvailabilityForm />;
            case "schedule":
                return <ViewPreceptorSchedule />;
            case "evaluation":
                return <PreceptorEvaluationForm />;
            default:
                return (
                    <div className="content-box">
                        <h2>Welcome, Dr. {preceptorData?.firstname} {preceptorData?.lastname}</h2>
                        <p>Please select an option from the navigation menu.</p>
                    </div>
                );
        }
    };

    if (!preceptorData && !error && !showTokenModal) {
        return (
            <div className="page-container">
                <div className="content-box">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar setCurrentView={setCurrentView} userType="preceptor" />
            <div className="content">
                {error && !showTokenModal && (
                    <div className="status-error">{error}</div>
                )}
                {renderContent()}
            </div>
            <TokenExpirationModal 
                show={showTokenModal}
                onClose={() => setShowTokenModal(false)}
            />
        </div>
    );
};

export default PreceptorDashboard; 