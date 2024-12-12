import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

if (!process.env.REACT_APP_API_URL) {
    throw new Error('REACT_APP_API_URL environment variable is not set');
}

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Force reload to trigger auth context update
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Add request interceptor to add token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

export default api; 