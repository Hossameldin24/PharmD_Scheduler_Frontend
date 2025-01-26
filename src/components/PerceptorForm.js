import React, { useState } from 'react';
import axios from 'axios';
import './../PerceptorForm.css';

const PreceptorForm = () => {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [availability, setAvailability] = useState([0, 0, 0, 0, 0, 0]); // Availability for 6 rotations

    const departmentOptions = ["Oncology", "Physiology", "Cardiology", "Psychiatry", "Ophthalmology", "Neurology"]; // Fixed options

    const handleAvailabilityChange = (index, value) => {
        // Ensure the value is between 0 and 2
        if (value < 0 || value > 2) return; // Prevent invalid values
        const newAvailability = [...availability];
        newAvailability[index] = value;
        setAvailability(newAvailability);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Send the name, department, and availability to the backend
            const response = await axios.post('http://127.0.0.1:8000/add_preceptor/', { name, department, availability });
            alert(response.data.status);
        } catch (error) {
            console.error('Error adding preceptor:', error);
            alert('Failed to add preceptor');
        }
    };

    return (
        <form className="preceptor-form" onSubmit={handleSubmit}>
            <h1>Add Preceptor</h1>
            {/* Input for preceptor's name */}
            <input
                type="text"
                className="preceptor-form-input"  // Using the scoped class
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Preceptor Name"
                required
            />
            {/* Dropdown for department selection */}
            <select
                className="preceptor-form-input"  // Scoped class
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
            >
                <option value="" disabled>Select Department</option>
                {departmentOptions.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                ))}
            </select>

            {/* Availability for 6 rotations */}
            <h3>Availability (for 6 rotations, enter 0, 1, or 2)</h3>
            {availability.map((value, index) => (
                <input
                    key={index}
                    type="number"
                    className="preceptor-form-input"  // Scoped class
                    value={value}
                    onChange={(e) => handleAvailabilityChange(index, parseInt(e.target.value))}
                    placeholder={`Rotation ${index + 1} (0-2)`}
                    required
                    min="0"
                    max="2"
                />
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};

export default PreceptorForm;
