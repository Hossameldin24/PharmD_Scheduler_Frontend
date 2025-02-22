import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/theme.css';

const PreceptorEvaluationForm = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [evaluation, setEvaluation] = useState({
        degree: 0,
        description: '',
        comment: ''
    });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(
                    'http://127.0.0.1:8000/crud/preceptor/students',
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    }
                );
                setStudents(response.data);
                console.log(students);
            } catch (err) {
                setError('Failed to fetch students');
            }
        };

        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(
                'http://127.0.0.1:8000/crud/send_student_evaluation',
                {
                    student_id: selectedStudent,
                    eval_degree: evaluation.degree,
                    eval_description: evaluation.description,
                    eval_comment: evaluation.comment
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            setSuccess('Evaluation submitted successfully!');
            setSelectedStudent('');
            setEvaluation({
                degree: 0,
                description: '',
                comment: ''
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit evaluation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="content-box">
                <h1 className="page-title">Submit Student Evaluation</h1>
                
                {error && <div className="status-error">{error}</div>}
                {success && <div className="status-success">{success}</div>}
                
                <form onSubmit={handleSubmit} className="evaluation-form">
                    <div className="form-group">
                        <label>Student</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            required
                        >
                            <option value="">Select Student</option>
                            {students.map((rotationStudents, rotationIndex) => (
                                rotationStudents.length > 0 && (
                                    <optgroup key={rotationIndex} label={`Rotation ${rotationIndex + 1}`}>
                                        {rotationStudents.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Evaluation Degree (0-100)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={evaluation.degree}
                            onChange={(e) => setEvaluation({
                                ...evaluation,
                                degree: parseFloat(e.target.value)
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            value={evaluation.description}
                            onChange={(e) => setEvaluation({
                                ...evaluation,
                                description: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Comments</label>
                        <textarea
                            value={evaluation.comment}
                            onChange={(e) => setEvaluation({
                                ...evaluation,
                                comment: e.target.value
                            })}
                            rows="4"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="button-primary"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Evaluation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PreceptorEvaluationForm; 