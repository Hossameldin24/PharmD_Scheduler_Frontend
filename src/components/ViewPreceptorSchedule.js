import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import "../styles/theme.css";

const ViewPreceptorSchedule = () => {
    const [schedulesByYear, setSchedulesByYear] = useState({});
    const [selectedYear, setSelectedYear] = useState('');
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axiosInstance.get('/crud/preceptor/students');
                setSchedulesByYear(response.data);
                const availableYears = Object.keys(response.data).sort((a, b) => b - a); // Sort descending
                setYears(availableYears);
                if (availableYears.length > 0) {
                    setSelectedYear(availableYears[0]); // Set the most recent year as default
                }
            } catch (err) {
                setError('Failed to fetch schedules');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        setSelectedYear(newYear);
    };

    if (loading) {
        return <div className="loading">Loading schedules...</div>;
    }

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">View Preceptor Schedules</h1>
                
                {error && <div className="status-error" role="alert">{error}</div>}
                
                <div className="schedule-controls">
                    {years.length > 0 && (
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="select-control"
                        >
                            <option value="">Select Year</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {selectedYear && schedulesByYear[selectedYear] && (
                    <div className="schedule-table-container">
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Rotation</th>
                                    <th>Students</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedulesByYear[selectedYear].map((rotationStudents, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                        <td>Rotation {index + 1}</td>
                                        <td>
                                            {Array.isArray(rotationStudents) && rotationStudents.length > 0 ? (
                                                <div className="students-table">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Email</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rotationStudents.map((student, sIndex) => (
                                                                <tr key={sIndex}>
                                                                    <td>{student.name}</td>
                                                                    <td>{student.email}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="no-students">No students assigned</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewPreceptorSchedule;