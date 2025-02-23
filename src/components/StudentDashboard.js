import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Routes, Route } from "react-router-dom";
import "../styles/theme.css";
import Navbar from "./navbar.js";
import StudentChoiceForm from "./StudentChoiceForm.js";
import ViewStudentSchedule from "./ViewStudentSchedule.js";
import StudentAttendanceForm from "./StudentAttendanceForm.js"

const StudentDashboard = () => {
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState("");
    const [currentView, setCurrentView] = useState("dashboard");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/auth/student/dashboard",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setStudentData(response.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch student data. Please try again later.");
            }
        };

        fetchStudentData();
    }, [navigate]);

    if (error) {
        return (
            <div className="page-container">
                <div className="content-box">
                    <p className="status-error">{error}</p>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="page-container">
                <div className="content-box">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case "choices":
                return <StudentChoiceForm />;
            case "schedule":
                return <ViewStudentSchedule />;
            case "forms":
                return <StudentAttendanceForm />;
            case "dashboard":
            default:
                return (
                    <div className="card">
                        <h2>Personal Information</h2>
                        <div className="table-container">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>Student ID</th>
                                        <td>{studentData._id}</td>
                                    </tr>
                                    <tr>
                                        <th>Email</th>
                                        <td>{studentData.email}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="page-container">
            <Navbar setCurrentView={setCurrentView} userType="student" />
            <div className="content-box">
                {currentView === "dashboard" && (
                    <h1 className="page-title">
                        Welcome, {studentData.firstname} {studentData.lastname}
                    </h1>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default StudentDashboard;
