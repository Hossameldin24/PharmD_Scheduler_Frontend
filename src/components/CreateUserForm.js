import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const CreateUserForm = () => {
    const [userType, setUserType] = useState('');
    const [specialties, setSpecialties] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        specialityId: '',
        isAdmin: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/crud/get_all_specialities', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });
                setSpecialties(response.data);
            } catch (err) {
                console.error('Failed to fetch specialties:', err);
            }
        };
        fetchSpecialties();
    }, []);

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = userType === 'student'
                ? 'http://127.0.0.1:8000/crud/insert_student'
                : 'http://127.0.0.1:8000/crud/add_preceptor';

            const formDataObj = new FormData();

            if (userType === 'student') {
                formDataObj.append('studentId', formData.id);
            } else {
                formDataObj.append('preceptorId', formData.id);
                formDataObj.append('specialityId', formData.specialityId);
                formDataObj.append('isAdmin', formData.isAdmin);
            }

            formDataObj.append('firstname', formData.firstname);
            formDataObj.append('lastname', formData.lastname);
            formDataObj.append('email', formData.email);
            formDataObj.append('password', formData.password);

            const response = await axios.post(endpoint, formDataObj, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(`${userType} created successfully!`);
            setFormData({
                id: '',
                email: '',
                password: '',
                firstname: '',
                lastname: '',
                specialityId: '',
                isAdmin: false,
            });
            setUserType('');
        } catch (err) {
            const errorMessage = err.response?.data?.detail;
            setError(Array.isArray(errorMessage) ? errorMessage[0]?.msg : errorMessage || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-container" style={{ position: 'relative' }}> {/* Add relative positioning */}
                <h2>Create New User</h2>
                {error && (
                    <div className="error-message">
                        {typeof error === 'string' ? error : 'An error occurred'}
                    </div>
                )}
                {showSuccess && (
                    <div className={`success-notification ${!showSuccess ? 'hide' : ''}`}>
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
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
                                            value={formData.specialityId}
                                            onChange={(e) => setFormData({...formData, specialityId: e.target.value})}
                                            required
                                            className="input-field"
                                        >
                                            <option value="">Select Speciality</option>
                                            {specialties.map(specialty => (
                                                <option key={specialty._id} value={specialty._id}>
                                                    {specialty.speciality}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAdmin}
                                            onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                                        />
                                        <label>Is Admin</label>
                                    </div>
                                </>
                            )}
                            <button type="submit" className="submit-button button-secondary" disabled={loading}>
                                {loading ? 'Creating User...' : 'Create User'}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateUserForm;