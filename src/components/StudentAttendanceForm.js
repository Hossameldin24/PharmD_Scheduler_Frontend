import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import '../styles/theme.css';

const StudentAttendanceForm = () => {
    const [selectedRotation, setSelectedRotation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosInstance.post('/send_attendance_request/', {
                preceptor_id: localStorage.getItem('current_preceptor'),
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString()
            });
            setSuccess('Attendance request submitted successfully!');
            setStartDate('');
            setEndDate('');
            setSelectedRotation('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit attendance request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">Submit Attendance Request</h1>
                
                {error && <div className="status-error">{error}</div>}
                {success && <div className="status-success">{success}</div>}
                
                <form onSubmit={handleSubmit} className="attendance-form">
                    <div className="form-group">
                        <label>Start Date and Time</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date and Time</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="button-primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Attendance Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentAttendanceForm; 