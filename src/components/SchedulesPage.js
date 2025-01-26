import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GenerateSchedule from './GenerateSchedule';

const SchedulesPage = () => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/get_schedules/');
                setSchedules(response.data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };

        fetchSchedules();
    }, []);

    const handleSchedulesFetched = (fetchedSchedules) => {
        setSchedules(fetchedSchedules);
    };

    return (
        <div>
            <GenerateSchedule onSchedulesFetched={handleSchedulesFetched} />
            <h1>Schedules</h1>
            <div>
                {schedules.length === 0 ? (
                    <p>No schedules available.</p>
                ) : (
                    schedules.map((schedule, index) => (
                        <div key={index}>
                            <h3>Student: {schedule.student_name}</h3>
                            <ul>
                                {schedule.schedules.map((rotation, idx) => (
                                    <li key={idx}>
                                        Rotation {rotation.rotation}: Department - {rotation.department}, Preceptor - {rotation.preceptor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SchedulesPage;
