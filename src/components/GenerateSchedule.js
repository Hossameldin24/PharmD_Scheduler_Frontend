import React from 'react';
import { generateSchedule, fetchSchedules } from '../api/api'
import './../GenerateSchedule.css'; // Import the CSS file

const GenerateSchedule = ({ onSchedulesFetched }) => {
    const handleGenerateSchedule = async () => {
        try {
            const result = await generateSchedule();
            alert(result.status); // Show success message
            await fetchSchedulesData(); // Fetch schedules after generating
        } catch (error) {
            alert('Failed to generate schedule');
        }
    };

    const fetchSchedulesData = async () => {
        try {
            const schedules = await fetchSchedules(); // Fetch schedules from the backend
            onSchedulesFetched(schedules); // Call the parent component's handler
        } catch (error) {
            alert('Failed to fetch schedules');
        }
    };

    return (
        <div className="schedule-container">
            <h2>Generate Schedule</h2>
            <button className="generate-button" onClick={handleGenerateSchedule}>
                Generate Schedule
            </button>
        </div>
    );
};

export default GenerateSchedule;