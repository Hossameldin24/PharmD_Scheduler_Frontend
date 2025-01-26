import React, { useState } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const CreateUserForm = () => {
    const [userType, setUserType] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        speciality: '',
        isAdmin: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const departments = [
        'Ambulatory Care', 'Cardiology', 'Critical Care',
        'Emergency Medicine', 'Family Medicine', 'General Medicine',
        'Geriatrics', 'Infectious Disease', 'Internal Medicine',
        'Neurology', 'Oncology', 'Pediatrics', 'Psychiatry', 'Surgery'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = userType === 'student' 
                ? 'http://127.0.0.1:8000/auth/register/student'
                : 'http://127.0.0.1:8000/auth/register/preceptor';

            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            setSuccess(`${userType} created successfully!`);
            setFormData({
                id: '',
                email: '',
                password: '',
                firstname: '',
                lastname: '',
                speciality: '',
                isAdmin: false,
            });
            setUserType('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">Create New User</h1>

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

                <form onSubmit={handleSubmit} className="create-user-form">
                    <div className="form-group">
                        <label>User Type</label>
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            required
                            className="input-field"
                        >
                            <option value="">Select User Type</option>
                            <option value="student">Student</option>
                            <option value="preceptor">Preceptor</option>
                        </select>
                    </div>

                    {userType && (
                        <>
                            <div className="form-group">
                                <label>ID</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstname}
                                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                                    required
                                    className="input-field"
                                />
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastname}
                                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                                    required
                                    className="input-field"
                                />
                            </div>

                            {userType === 'preceptor' && (
                                <>
                                    <div className="form-group">
                                        <label>Speciality</label>
                                        <select
                                            value={formData.speciality}
                                            onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                                            required
                                            className="input-field"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={formData.isAdmin}
                                                onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                            />
                                            Is Admin
                                        </label>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <button 
                        type="submit" 
                        className="button-primary"
                        disabled={loading || !userType}
                    >
                        {loading ? 'Creating User...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateUserForm; 