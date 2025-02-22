import axios from 'axios';

// Create custom axios instance
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000'
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Dispatch a custom event for token expiration
            const event = new CustomEvent('tokenExpired');
            window.dispatchEvent(event);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;