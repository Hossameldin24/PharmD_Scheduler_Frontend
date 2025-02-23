// PreceptorEvaluationForm.jsx
import React, { useState, useEffect } from 'react';
import '../styles/PreceptorEvaluationForm.css';
import "../styles/theme.css";

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
        const response = await fetch('http://127.0.0.1:8000/crud/preceptor/latest_year_students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const data = await response.json();
        setStudents(data);
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
      const response = await fetch('http://127.0.0.1:8000/crud/send_student_evaluation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          eval_degree: evaluation.degree,
          eval_description: evaluation.description,
          eval_comment: evaluation.comment
        })
      });

      if (!response.ok) throw new Error('Failed to submit evaluation');
      
      setSuccess('Evaluation submitted successfully!');
      setSelectedStudent('');
      setEvaluation({
        degree: 0,
        description: '',
        comment: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-container">
      <div className="evaluation-card">
        <h1 className="evaluation-title">Student Evaluation</h1>
        
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="form-group">
            <label>Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Choose a student</option>
              {students.map((rotationStudents, rotationIndex) => (
                <optgroup key={rotationIndex} label={`Rotation ${rotationIndex + 1}`}>
                  {rotationStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Evaluation Score (0-100)</label>
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
              placeholder="Enter score"
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
              placeholder="Brief description of the evaluation"
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
              placeholder="Detailed comments about the student's performance"
            />
          </div>

          <button
            type="submit"
            className={`submit-button ${loading ? 'loading' : ''}`}
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