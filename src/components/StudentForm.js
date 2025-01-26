import React, { useState } from 'react';
import axios from 'axios';
import './../StudentForm.css'; // New CSS for improved layout

const StudentForm = () => {
    const [name, setName] = useState('');
    const [choices, setChoices] = useState([['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']]);
    const [schedule, setSchedule] = useState([]);

    const departmentOptions = ["Oncology", "Physiology", "Cardiology", "Psychiatry", "Ophthalmology", "Neurology"];

    const handleChoiceChange = (rotationIndex, choiceIndex, value) => {
        const newChoices = [...choices];
        newChoices[rotationIndex][choiceIndex] = value;
        setChoices(newChoices);
    };

    const isDepartmentDisabled = (rotationIndex, department, choiceIndex) => {
        return choices[rotationIndex].includes(department) && choices[rotationIndex][choiceIndex] !== department;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/add_student/', { name, choices, schedule});
            alert(response.data.status);
        } catch (error) {
            console.error('Error adding student:', error);
            alert('Failed to add student');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="student-form">
            <h2>Add Student</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                required
                className="input-field"
            />

            <h3>Department Choices for Each Rotation</h3>
            {choices.map((rotationChoices, rotationIndex) => (
                <div key={rotationIndex} className="rotation-block">
                    <h4>Rotation {rotationIndex + 1}</h4>
                    {rotationChoices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="choice-block">
                            <label>{`${choiceIndex + 1}st Choice`}</label>
                            <select
                                value={choice}
                                onChange={(e) => handleChoiceChange(rotationIndex, choiceIndex, e.target.value)}
                                required
                                className="select-box"
                            >
                                <option value="" disabled>Select Department</option>
                                {departmentOptions.map((dept) => (
                                    <option key={dept} value={dept} disabled={isDepartmentDisabled(rotationIndex, dept, choiceIndex)}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            ))}
            <button type="submit" className="submit-button">Submit</button>
        </form>
    );
};

export default StudentForm;
