import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const StudentChoiceForm = () => {
    // Initialize state with all possible choices
    const [choices, setChoices] = useState(
        Array.from({ length: 8 }, () => Array.from({ length: 4 }, () => ""))
      );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Get student ID from localStorage or context
    const studentId = localStorage.getItem('student_id');

    const departments = [
        'Ambulatory Care',
        'Cardiology',
        'Critical Care',
        'Emergency Medicine',
        'Family Medicine',
        'General Medicine',
        'Geriatrics',
        'Infectious Disease',
        'Internal Medicine',
        'Neurology',
        'Oncology',
        'Pediatrics',
        'Psychiatry',
        'Surgery'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/crud/update_student_choices/${studentId}`,
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

    const handleChange = (rotation, choice, value) => {
        setChoices(prev => ({
            ...prev,
            [`Rotation${rotation}Choice${choice}`]: value
        }));
    };

    const renderRotationChoices = (rotationNumber) => (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ 
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
                fontFamily: 'var(--font-heading)'
            }}>
                Rotation {rotationNumber}
            </h3>
            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {[1, 2, 3, 4].map(choiceNum => (
                    <div key={`Rotation${rotationNumber}Choice${choiceNum}`}>
                        <label 
                            htmlFor={`Rotation${rotationNumber}Choice${choiceNum}`}
                            style={{ 
                                display: 'block', 
                                marginBottom: 'var(--spacing-xs)',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}
                        >
                            Choice {choiceNum}
                        </label>
                        <select
                            id={`Rotation${rotationNumber}Choice${choiceNum}`}
                            value={choices[`Rotation${rotationNumber}Choice${choiceNum}`]}
                            onChange={(e) => handleChange(rotationNumber, choiceNum, e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
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
                        Please select your preferred departments for each rotation.
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
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(rotationNum => renderRotationChoices(rotationNum))}
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