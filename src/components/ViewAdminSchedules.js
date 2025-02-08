import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/theme.css";

const ViewAdminSchedules = () => {
    const [students, setStudents] = useState([]); // List of all students
    const [preceptors, setPreceptors] = useState([]); // List of all preceptors
    const [selectedType, setSelectedType] = useState(''); // 'student' or 'preceptor'
    const [selectedId, setSelectedId] = useState(''); // Selected student or preceptor ID
    const [schedule, setSchedule] = useState([]); // Schedule data for the selected user
    const [loading, setLoading] = useState(true); // Loading state for initial data fetch
    const [fetchingSchedule, setFetchingSchedule] = useState(false); // Loading state for schedule fetch
    const [error, setError] = useState(''); // Error message

    // Fetch all students and preceptors
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsResponse, preceptorsResponse] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/crud/get_all_student_ids', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }),
                    axios.get('http://127.0.0.1:8000/crud/get_all_preceptor_ids', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    })
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

    // Reset schedule and selectedId when selectedType changes
    useEffect(() => {
        setSchedule([]); // Reset schedule state
        setSelectedId(''); // Reset selected ID
    }, [selectedType]);

    // Fetch schedule for the selected student or preceptor
    // Fetch schedule for the selected student or preceptor
useEffect(() => {
    if (selectedType && selectedId) {
        const fetchSchedule = async () => {
            setFetchingSchedule(true); // Start fetching schedule
            setSchedule([]); // Clear previous schedule immediately
            setError(''); // Clear any previous errors

            try {
                const endpoint = selectedType === 'student'
                    ? `http://127.0.0.1:8000/crud/student/get_schedule_by_id/${selectedId}`
                    : `http://127.0.0.1:8000/crud/preceptor/get_schedule_by_id/${selectedId}`;

                const response = await axios.get(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });

                setSchedule(response.data);
            } catch (err) {
                setError('Failed to fetch schedule');
            } finally {
                setFetchingSchedule(false); // Finish fetching schedule
            }
        };

        // Call the function
        fetchSchedule();
    } else {
        // Reset schedule if no student/preceptor is selected
        setSchedule([]);
    }
}, [selectedType, selectedId]);


    if (loading) return <div>Loading data...</div>;
    if (error) return <div className="status-error">{error}</div>;

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">View Schedules</h1>

                {/* Dropdown to select user type (student or preceptor) */}
                <div className="form-group">
                    <label>Select User Type</label>
                    <select
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setSelectedId(''); // Reset selected ID when type changes
                        }}
                        className="input-field"
                    >
                        <option value="">Select Type</option>
                        <option value="student">Student</option>
                        <option value="preceptor">Preceptor</option>
                    </select>
                </div>

                {/* Dropdown to select student or preceptor */}
                {selectedType && (
                    <div className="form-group">
                        <label>Select {selectedType === 'student' ? 'Student' : 'Preceptor'}</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select {selectedType === 'student' ? 'Student' : 'Preceptor'}</option>
                            {selectedType === 'student'
                                ? students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.firstname} {student.lastname} (ID: {student._id})
                                    </option>
                                ))
                                : preceptors.map((preceptor) => (
                                    <option key={preceptor._id} value={preceptor._id}>
                                        {preceptor.firstname} {preceptor.lastname} (ID: {preceptor._id})
                                    </option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Display schedule */}
                {selectedId && (
                    <div className="schedule-container">
                        <h2>Schedule for {selectedType === 'student' ? 'Student' : 'Preceptor'}</h2>
                        {fetchingSchedule ? (
                            <div>Loading schedule...</div> // Show loading message while fetching
                        ) : (
                            <div>
                                {selectedType === 'student' ? (
                                    // Display preceptor and specialty data for students
                                    <ul>
                                        {schedule.map((item, index) => (
                                            <li key={index} className="schedule-item">
                                                <p><strong>Preceptor:</strong> {item.preceptor.firstname} {item.preceptor.lastname}</p>
                                                <p><strong>Email:</strong> {item.preceptor.email}</p>
                                                <p><strong>Speciality:</strong> {item.speciality.speciality}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    // Display students per rotation for preceptors
                                    <div>
                                        {schedule.map((rotation, rotationIndex) => (
                                            <div key={rotationIndex} className="rotation-card">
                                                <h3>Rotation {rotationIndex + 1}</h3>
                                                {rotation.length === 0 ? (
                                                    <p>No students assigned</p>
                                                ) : (
                                                    <ul>
                                                        {rotation.map((student, studentIndex) => (
                                                            <li key={studentIndex} className="student-info">
                                                                <p><strong>Name:</strong> {student.name}</p>
                                                                <p><strong>ID:</strong> {student.id}</p>
                                                                <p><strong>Email:</strong> {student.email}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewAdminSchedules;