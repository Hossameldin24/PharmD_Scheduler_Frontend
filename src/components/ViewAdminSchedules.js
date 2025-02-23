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
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [schedulesByYear, setSchedulesByYear] = useState({});
    const [success, setSuccess] = useState('');

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

    useEffect(() => {
        if (selectedType) {
            setSelectedId('');
            setSelectedYear('');
            setSchedule([]);
            setDisplaySchedule([]);
            setError('');
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
        setNewSchedule(Array(schedule.length).fill([]));
    };

    const handleEdit = (rotationIndex) => {
        if (!isEditing) return;
        setEditingRotation(rotationIndex);
    };

    const handlePreceptorChange = (rotationIndex, preceptorId, specialityId) => {
        // Check if the selected preceptor is different from the current one
        const currentRotation = schedule[rotationIndex];
        const isPreceptorChanged = currentRotation.preceptor._id !== preceptorId
        
        // Create a copy of the current newSchedule
        const updatedSchedule = [...newSchedule];
        
        if (isPreceptorChanged) {
            // Only update newSchedule if there's a change
            updatedSchedule[rotationIndex] = [preceptorId, specialityId];
        } else {
            // If no change, set empty array at this index
            updatedSchedule[rotationIndex] = [];
        }
        setNewSchedule(updatedSchedule);
        
        // Update display schedule regardless of whether there's a change
        const specialityData = availablePreceptors[rotationIndex][specialityId];
        if (specialityData) {
            const selectedPreceptor = specialityData.preceptors.find(p => p._id === preceptorId);
            
            if (selectedPreceptor) {
                const updatedDisplaySchedule = [...displaySchedule];
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
        
        setEditingRotation(null);
    };

    const handleSaveChanges = async () => {
        try {
            // Initialize an array of 8 empty arrays
            const rotationChanges = Array(8).fill().map(() => []);
            
            // Fill in the changes where preceptors were modified
            newSchedule.forEach((rotation, index) => {
                if (rotation.length === 2) {
                    // Convert IDs to strings to match the endpoint's expected type
                    rotationChanges[index] = [String(rotation[0]), String(rotation[1])];
                } else {
                    // Explicitly set empty array for unchanged rotations
                    rotationChanges[index] = [];
                }
            });
    
            // Check if any changes were made
            const hasChanges = rotationChanges.some(rotation => rotation.length > 0);
            
            if (!hasChanges) {
                setError('No changes to save');
                return;
            }
    
            if (!selectedYear) {
                setError('Please select a year before saving changes');
                return;
            }
    
            console.log("StudentID:", selectedId);
            console.log("Year:", selectedYear);
            console.log("Changes to be sent:", rotationChanges);
    
            // Append parameters to URL
            const url = `/crud/update_student_preceptors?student_id=${selectedId}&year=${selectedYear}`;
            
            const response = await axiosInstance.put(
                url,
                rotationChanges  // Send newSched as the request body
            );
    
            setIsEditing(false);
            setEditingRotation(null);
            setError('');
            fetchSchedule(selectedId, 'student');
        } catch (err) {
            let errorMessage = 'Failed to update schedule';
            
            if (err.response) {
                console.error("Error response:", err.response.data);
                const responseError = err.response.data;
                
                if (typeof responseError === 'string') {
                    errorMessage = responseError;
                } else if (responseError.detail) {
                    errorMessage = responseError.detail;
                } else if (responseError.msg) {
                    errorMessage = responseError.msg;
                } else if (Array.isArray(responseError)) {
                    errorMessage = responseError.map(e => e.msg || e.message || e).join(', ');
                } else if (typeof responseError === 'object') {
                    errorMessage = Object.values(responseError).flat().join(', ');
                }
            }
            
            setError(errorMessage);
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
            
            // Store all schedules by year
            setSchedulesByYear(response.data);
            // Get available years and sort them
            const availableYears = Object.keys(response.data).sort((a, b) => b - a); // Sort descending
            setYears(availableYears);
            
            // Set most recent year as default if no year is selected
            if (!selectedYear && availableYears.length > 0) {
                setSelectedYear(availableYears[0]);
                setSchedule(response.data[availableYears[0]]);
                setDisplaySchedule(response.data[availableYears[0]]);
            } else if (selectedYear && response.data[selectedYear]) {
                setSchedule(response.data[selectedYear]);
                setDisplaySchedule(response.data[selectedYear]);
            }
            
            if (type === 'student') {
                setNewSchedule(Array(response.data[selectedYear]?.length || 0).fill([]));
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

    useEffect(() => {
        if (selectedId && selectedType) {
            fetchSchedule(selectedId, selectedType);
        }
    }, [selectedId]);

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);
        setSelectedId('');
        setSchedule([]);
        setDisplaySchedule([]);
        setError('');
    };

    const handleIdChange = (e) => {
        const newId = e.target.value;
        setSelectedId(newId);
        setSelectedYear('');
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        setSelectedYear(newYear);
        if (schedulesByYear[newYear]) {
            setSchedule(schedulesByYear[newYear]);
            setDisplaySchedule(schedulesByYear[newYear]);
            if (selectedType === 'student') {
                setNewSchedule(Array(schedulesByYear[newYear].length).fill([]));
            }
        }
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">View Schedules</h1>
                
                {error && <div className="status-error" role="alert">{error}</div>}
                {success && <div className="status-success" role="alert">{success}</div>}
                
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

                    {selectedId && years.length > 0 && (
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
                                                setDisplaySchedule(schedule);
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
                                                                    htmlFor={`preceptor-${editingRotation}-${preceptor.id}`}
                                                                    className="preceptor-label"
                                                                    onClick={() => handlePreceptorChange(editingRotation, preceptor.id, specialityId)}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`rotation-${editingRotation}`}
                                                                        id={`preceptor-${editingRotation}-${preceptor.id}`}
                                                                        onChange={() => {}}
                                                                        checked={newSchedule[editingRotation]?.[0] === preceptor.id && 
                                                                                newSchedule[editingRotation]?.[1] === specialityId}
                                                                    />
                                                                    <span className="preceptor-name">
                                                                        {preceptor.id} Dr. {preceptor.firstname} {preceptor.lastname}
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