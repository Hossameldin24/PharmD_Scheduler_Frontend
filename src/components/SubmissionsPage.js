import React from 'react';
import StudentForm from './StudentForm';
import PerceptorForm from './PerceptorForm';
import GenerateSchedule from './GenerateSchedule';
import './../FormsPage.css';

const SubmissionsPage = () => {
    return (
        <div className="forms-page">
            <div className="forms-container">
                <div className="form-item">
                    <StudentForm />
                </div>
                <div className="form-item">
                    <PerceptorForm />
                </div>
            </div>
        </div>
    );
};

export default SubmissionsPage;