import React, { useState } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const PerceptorAvailabilityForm = () => {
    const [availability, setAvailability] = useState(Array(8).fill(0));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const preceptorId = localStorage.getItem('preceptor_id');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/crud/update_preceptor_availability/${preceptorId}`,
                {
                    preceptorid: preceptorId,
                    availability: availability
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Availability updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update availability');
        } finally {
            setLoading(false);
        }
    };

    const handleAvailabilityChange = (rotationIndex, value) => {
        const newValue = Math.max(0, Math.min(2, parseInt(value) || 0));
        const newAvailability = [...availability];
        newAvailability[rotationIndex] = newValue;
        setAvailability(newAvailability);
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">Update Rotation Availability</h1>
                
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ 
                        textAlign: 'center', 
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)'
                    }}>
                        Please indicate your availability for each rotation:<br/>
                        0 = Not available | 1 = Available for one student | 2 = Available for two students
                    </p>
                </div>

                {error && (
                    <div className="status-badge status-error">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="status-badge status-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="availability-grid">
                        {availability.map((value, index) => (
                            <div key={index} className="card availability-card">
                                <h3>Rotation {index + 1}</h3>
                                <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    value={value}
                                    onChange={(e) => handleAvailabilityChange(index, e.target.value)}
                                    className="availability-input"
                                />
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="button-primary"
                        style={{ 
                            width: '100%',
                            marginTop: 'var(--spacing-xl)'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Updating Availability...' : 'Save Availability'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PerceptorAvailabilityForm; 