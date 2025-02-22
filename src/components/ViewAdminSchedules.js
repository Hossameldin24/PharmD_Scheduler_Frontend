import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import "../styles/theme.css";

const ViewAdminSchedules = () => {
    const [students, setStudents] = useState([]);
    const [preceptors, setPreceptors] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [displaySchedule, setDisplaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingSchedule, setFetchingSchedule] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editingRotation, setEditingRotation] = useState(null);
    const [availablePreceptors, setAvailablePreceptors] = useState([]);
    const [newSchedule, setNewSchedule] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsResponse, preceptorsResponse] = await Promise.all([
                    axiosInstance.get('/crud/get_all_student_ids'),
                    axiosInstance.get('/crud/get_all_preceptor_ids')
                ]);

                setStudents(studentsResponse.data);
                setPreceptors(preceptorsResponse.data);
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Reset selectedId when selectedType changes
    useEffect(() => {
        if (selectedType) {
            setSelectedId(''); // Reset selected ID
            setSchedule([]);   // Clear schedule data
            setDisplaySchedule([]); // Clear display schedule
            setError(''); // Clear any previous errors
        }
    }, [selectedType]);

    const fetchPreceptorsWithSpecialities = async () => {
        try {
            const response = await axiosInstance.get(
                '/crud/get_all_preceptors_with_specialities/'
            );
            setAvailablePreceptors(response.data);
        } catch (err) {
            setError('Failed to fetch preceptors data');
        }
    };

    const handleEditMode = () => {
        setIsEditing(true);
        fetchPreceptorsWithSpecialities();
    };

    const handleEdit = (rotationIndex) => {
        if (!isEditing) return;
        setEditingRotation(rotationIndex);
    };

    const handlePreceptorChange = (rotationIndex, preceptorId, specialityId) => {
        const updatedSchedule = [...newSchedule];
        updatedSchedule[rotationIndex] = [preceptorId, specialityId];
        setNewSchedule(updatedSchedule);
        
        // Find the preceptor and speciality data
        const specialityData = availablePreceptors[rotationIndex][specialityId];
        if (specialityData) {
            const selectedPreceptor = specialityData.preceptors.find(p => p._id === preceptorId);
            
            if (selectedPreceptor) {
                // Create a copy of displaySchedule
                const updatedDisplaySchedule = [...displaySchedule];
                // Update with new preceptor info
                updatedDisplaySchedule[rotationIndex] = {
                    ...updatedDisplaySchedule[rotationIndex],
                    preceptor: {
                        _id: selectedPreceptor._id,
                        firstname: selectedPreceptor.firstname,
                        lastname: selectedPreceptor.lastname,
                        email: selectedPreceptor.email
                    },
                    speciality: {
                        _id: specialityId,
                        speciality: specialityData.speciality
                    }
                };
                setDisplaySchedule(updatedDisplaySchedule);
            }
        }
        
        setEditingRotation(null); // Close the rotation editor after selection
    };

    const handleSaveChanges = async () => {
        try {
            await axiosInstance.put('/crud/update_student_preceptors/', {
                student_id: selectedId,
                newSched: newSchedule
            });
            setIsEditing(false);
            setEditingRotation(null);
            // Refresh schedule
            fetchSchedule(selectedId, 'student');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update schedule');
        }
    };

    const fetchSchedule = async (id, type) => {
        if (!id || !type) return;
        
        setFetchingSchedule(true);
        setError('');
        
        try {
            const endpoint = type === 'student' 
                ? `/student/get_schedule_by_id/${id}`
                : `/preceptor/get_schedule_by_id/${id}`;
                
            const response = await axiosInstance.get(`/crud${endpoint}`);
            
            setSchedule(response.data);
            setDisplaySchedule(response.data); // Initialize display schedule with fetched data
            
            if (type === 'student') {
                // Initialize newSchedule array with empty arrays for each rotation
                setNewSchedule(Array(response.data.length).fill([]));
            }
            
            setIsEditing(false);
            setEditingRotation(null);
        } catch (err) {
            setSchedule([]);
            setDisplaySchedule([]);
            setError(err.response?.data?.detail || 'Failed to fetch schedule');
        } finally {
            setFetchingSchedule(false);
        }
    };

    // Only fetch when both type and id are selected
    useEffect(() => {
        if (selectedId && selectedType) {
            fetchSchedule(selectedId, selectedType);
        }
    }, [selectedId]);  // Only depend on selectedId, not on selectedType

    // Handle type selector change
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        setSelectedId(''); // Clear selected ID immediately
        setSchedule([]);   // Clear schedule data
        setDisplaySchedule([]); // Clear display schedule
        setError(''); // Clear any previous errors
    };

    // Handle id selector change
    const handleIdChange = (e) => {
        const newId = e.target.value;
        setSelectedId(newId);
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">View Schedules</h1>
                
                {error && <div className="status-error">{error}</div>}
                
                <div className="schedule-controls">
                    <select
                        value={selectedType}
                        onChange={handleTypeChange}
                        className="select-control"
                    >
                        <option value="">Select Type</option>
                        <option value="student">Student</option>
                        <option value="preceptor">Preceptor</option>
                    </select>

                    {selectedType && (
                        <select
                            value={selectedId}
                            onChange={handleIdChange}
                            className="select-control"
                        >
                            <option value="">Select {selectedType}</option>
                            {(selectedType === 'student' ? students : preceptors).map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.firstname} {user.lastname}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {!isEditing && selectedId && selectedType === 'student' && (
                    <div className="schedule-actions">
                        <button 
                            className="button-primary"
                            onClick={handleEditMode}
                            disabled={fetchingSchedule}
                        >
                            Edit Schedule
                        </button>
                    </div>
                )}

                {fetchingSchedule ? (
                    <div className="loading">Loading schedule...</div>
                ) : (
                    <>
                        {selectedType === 'student' && displaySchedule.length > 0 && displaySchedule[0]?.preceptor && (
                            <>
                                {isEditing && (
                                    <div className="schedule-actions edit-actions">
                                        <button 
                                            className="button-primary"
                                            onClick={handleSaveChanges}
                                        >
                                            Save Changes
                                        </button>
                                        <button 
                                            className="button-secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditingRotation(null);
                                                setDisplaySchedule(schedule); // Reset display to original
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                
                                <div className="schedule-table-container">
                                    <table className="schedule-table">
                                        <thead>
                                            <tr>
                                                <th>Rotation</th>
                                                <th>Preceptor</th>
                                                <th>Email</th>
                                                <th>Speciality</th>
                                                {isEditing && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displaySchedule.map((rotation, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                                                    <td>Rotation {index + 1}</td>
                                                    <td>Dr. {rotation.preceptor.firstname} {rotation.preceptor.lastname}</td>
                                                    <td>{rotation.preceptor.email}</td>
                                                    <td>{rotation.speciality.speciality}</td>
                                                    {isEditing && (
                                                        <td>
                                                            <button 
                                                                className="button-edit"
                                                                onClick={() => handleEdit(index)}
                                                            >
                                                                Change
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Preceptor selection modal */}
                                {editingRotation !== null && (
                                    <div className="modal-overlay">
                                        <div className="modal-content">
                                            <h3>Select Preceptor for Rotation {editingRotation + 1}</h3>
                                            <div className="preceptor-selection-grid">
                                                {availablePreceptors[editingRotation] && Object.entries(availablePreceptors[editingRotation]).map(([specialityId, data]) => (
                                                    <div key={specialityId} className="speciality-group">
                                                        <h4>{data.speciality}</h4>
                                                        {data.preceptors.map((preceptor, pIndex) => (
                                                            <div key={pIndex} className="preceptor-option">
                                                                <label 
                                                                    htmlFor={`preceptor-${editingRotation}-${preceptor._id}`}
                                                                    className="preceptor-label"
                                                                    onClick={() => handlePreceptorChange(editingRotation, preceptor._id, specialityId)}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`rotation-${editingRotation}`}
                                                                        id={`preceptor-${editingRotation}-${preceptor._id}`}
                                                                        onChange={() => {}} // Empty as we're handling with onClick
                                                                        checked={newSchedule[editingRotation]?.[0] === preceptor._id && 
                                                                                newSchedule[editingRotation]?.[1] === specialityId}
                                                                    />
                                                                    <span className="preceptor-name">
                                                                        Dr. {preceptor.firstname} {preceptor.lastname}
                                                                        <span className="availability-tag">
                                                                            Available: {preceptor.rotationAvailability}
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="modal-actions">
                                                <button 
                                                    className="button-secondary"
                                                    onClick={() => setEditingRotation(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {selectedType === 'preceptor' && displaySchedule.length > 0 && (
                            <div className="schedule-table-container">
                                <table className="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Rotation</th>
                                            <th>Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displaySchedule.map((rotationStudents, index) => (
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

                        {selectedId && ((selectedType === 'student' && displaySchedule.length > 0 && !displaySchedule[0]?.preceptor) ||
                        (selectedType === 'preceptor' && displaySchedule.length === 0)) && (
                            <div className="no-schedule-message">
                                No schedule found or schedule format is invalid.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewAdminSchedules;