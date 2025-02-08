import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const StudentChoiceForm = () => {
    // Initialize state for choices (using speciality IDs)
    const [choices, setChoices] = useState(
        Array(8).fill().map(() => Array(4).fill(""))
    );
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [specialities, setSpecialities] = useState([]);
    
    // Fetch specialities on component mount
    useEffect(() => {
        const fetchSpecialities = async () => {
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/crud/get_all_specialities',
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
                setSpecialities(response.data);
            } catch (err) {
                setError('Failed to fetch specialities');
            }
        };
        
        fetchSpecialities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.put(
                'http://127.0.0.1:8000/crud/student/choices',
                choices,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Rotation preferences updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (rotationIndex, choiceIndex, specialityId) => {
        const newChoices = [...choices];
        newChoices[rotationIndex][choiceIndex] = specialityId;
        setChoices(newChoices);
    };

    const renderRotationChoices = (rotationIndex) => (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ 
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
                fontFamily: 'var(--font-heading)'
            }}>
                Rotation {rotationIndex + 1}
            </h3>
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {[0, 1, 2, 3].map(choiceIndex => (
                    <div key={`rotation${rotationIndex}choice${choiceIndex}`}>
                        <label 
                            htmlFor={`rotation${rotationIndex}choice${choiceIndex}`}
                            style={{ 
                                display: 'block', 
                                marginBottom: 'var(--spacing-xs)',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}
                        >
                            Choice {choiceIndex + 1}
                        </label>
                        <select
                            id={`rotation${rotationIndex}choice${choiceIndex}`}
                            value={choices[rotationIndex][choiceIndex]}
                            onChange={(e) => handleChange(rotationIndex, choiceIndex, e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select Speciality</option>
                            {specialities.map(spec => (
                                <option key={spec._id} value={spec._id}>
                                    {spec.speciality}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">Rotation Preferences</h1>
                
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ 
                        textAlign: 'center', 
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)'
                    }}>
                        Please select your preferred specialities for each rotation.
                        Rank your choices from 1 (most preferred) to 4 (least preferred).
                    </p>
                </div>

                {error && (
                    <div className="status-badge status-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="status-badge status-success" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--spacing-lg)'
                    }}>
                        {Array.from({ length: 8 }, (_, i) => renderRotationChoices(i))}
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
                        {loading ? 'Updating Preferences...' : 'Save All Preferences'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentChoiceForm;