import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar.js";
import "../styles/theme.css";
import CreateUserForm from "./CreateUserForm.js";
import PerceptorAvailabilityForm from "./PerceptorAvailabilityForm.js";
import ViewAdminSchedules from "./ViewAdminSchedules.js";

const AdminDashboard = () => {
    const [adminData, setAdminData] = useState(null);
    const [error, setError] = useState("");
    const [currentView, setCurrentView] = useState("dashboard");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/auth/preceptor/dashboard",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setAdminData(response.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch admin data. Please try again later.");
            }
        };

        fetchAdminData();
    }, [navigate]);

    const renderContent = () => {
        switch (currentView) {
            case "create-user":
                return <CreateUserForm />;
            case "choices":
                return <PerceptorAvailabilityForm />;
            case "schedule":
                return <ViewAdminSchedules />;
            case "dashboard":
            default:
                return (
                    <div className="card">
                        <h2>Personal Information</h2>
                        <div className="table-container">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>Admin ID</th>
                                        <td>{adminData?.adminid}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{adminData?.email}</td>
                                    </tr>
                                    <tr>
                                        <th>Role</th>
                                        <td>Administrator</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    if (error) {
        return (
            <div className="page-container">
                <div className="content-box">
                    <p className="status-error">{error}</p>
                </div>
            </div>
        );
    }

    if (!adminData) {
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
            <Navbar setCurrentView={setCurrentView} userType="admin" />
            <div className="content-box">
                {currentView === "dashboard" && (
                    <h1 className="page-title">
                        Welcome, Dr. {adminData.firstname} {adminData.lastname}
                    </h1>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard; 