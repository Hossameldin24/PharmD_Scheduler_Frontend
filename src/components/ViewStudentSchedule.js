import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import "../styles/theme.css";

const ViewStudentSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await axiosInstance.get('/crud/student/get_latest_schedule');
                setSchedule(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to fetch schedule');
            } finally {
                setLoading(false);
            }
        };
        
        fetchSchedule();
    }, []);

    if (loading) return <div>Loading schedule...</div>;
    if (error) return <div className="status-error">{error}</div>;

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">My Schedule</h1>
                <div className="schedule-grid">
                    {schedule.map((rotation, index) => (
                        <div key={index} className="card schedule-card">
                            <h3>Rotation {index + 1}</h3>
                            <p>Preceptor: Dr. {rotation.preceptor.firstname} {rotation.preceptor.lastname}</p>
                            <p>Email: {rotation.preceptor.email}</p>
                            <p>Speciality: {rotation.speciality.speciality}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewStudentSchedule;