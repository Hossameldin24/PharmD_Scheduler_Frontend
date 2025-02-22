import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar.js";
import "../styles/theme.css";
import PerceptorAvailabilityForm from "./PerceptorAvailabilityForm.js";
import ViewPreceptorSchedule from "./ViewPreceptorSchedule.js";
import PreceptorEvaluationForm from "./PreceptorEvaluationForm.js";

const PreceptorDashboard = () => {
  const [preceptorData, setPreceptorData] = useState(null);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreceptorData = async () => {
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
        setPreceptorData(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch preceptor data. Please try again later.");
      }
    };
    fetchPreceptorData();
  }, [navigate]);

  const renderDashboardContent = () => {
    return (
      <div className="content-box">
        <h1 className="page-title">
          Welcome, Dr. {preceptorData.firstname} {preceptorData.lastname}
        </h1>
        <div className="card">
          <h2>Personal Information</h2>
          <div className="table-container">
            <table className="table">
              <tbody>
                <tr>
                  <th>Preceptor ID</th>
                  <td>{preceptorData.preceptorid}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{preceptorData.email}</td>
                </tr>
                <tr>
                  <th>Department</th>
                  <td>{preceptorData.speciality}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2>Current Students</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Rotation</th>
                  <th>Start Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "choices":
        return <PerceptorAvailabilityForm />;
      case "schedule":
        return <ViewPreceptorSchedule />;
      case "forms":
        return <PreceptorEvaluationForm />;
      case "dashboard":
      default:
        return renderDashboardContent();
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

  if (!preceptorData) {
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
      {renderContent()}
    </div>
  );
};

export default PreceptorDashboard;