import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import "../styles/theme.css";

const PreceptorAvailabilityForm = () => {
    const [availability, setAvailability] = useState(Array(8).fill(0));
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch current availability when component mounts
    useEffect(() => {
        const fetchAvailability = async () => {
            setFetchLoading(true);
            try {
                const response = await axiosInstance.get('/crud/get_preceptor_availability');
                // Assuming the API returns an array of availability values
                if (Array.isArray(response.data) && response.data.length === 8) {
                    setAvailability(response.data);
                }
            } catch (err) {
                setError('Failed to fetch current availability. Using default values.');
                setTimeout(() => setError(''), 3000);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axiosInstance.put('/crud/preceptor/availability', availability);
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

                {fetchLoading ? (
                    <div className="status-badge">
                        Loading your current availability...
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default PreceptorAvailabilityForm;