import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const ViewPreceptorSchedule = () => {
    const [rotations, setRotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/crud/preceptor/students',
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
                setRotations(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || 'Failed to fetch students');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <div>Loading students...</div>;
    if (error) return <div className="status-error">{error}</div>;

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">My Students</h1>
                <div className="rotations-container">
                    {rotations.map((students, rotationIndex) => (
                        <div key={rotationIndex} className="rotation-card">
                            <h2>Rotation {rotationIndex + 1}</h2>
                            {students.length === 0 ? (
                                <p>No students assigned</p>
                            ) : (
                                students.map((student) => (
                                    <div key={student.id} className="student-info">
                                        <h3>{student.name}</h3>
                                        <p>ID: {student.id}</p>
                                        <p>Email: {student.email}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ViewPreceptorSchedule;