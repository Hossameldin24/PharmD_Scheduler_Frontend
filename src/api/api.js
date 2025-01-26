import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const generateSchedule = async () => {
    try {
        const response = await axios.post(`${API_URL}/generate_schedule/`);
        return response.data; 
    } catch (error) {
        console.error('Error generating schedule:', error);
        throw error; 
    }
};

export const fetchSchedules = async () => {
    try {
        const response = await axios.get(`${API_URL}/get_schedules/`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error; 
    }
};
