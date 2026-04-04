import axios from 'axios';
import { Platform } from 'react-native';
import storage from './storage';

// Use local network IP address for physical devices.
// For Android emulator it usually routes localhost to 10.0.2.2.
// Replace this with your computer's local WiFi IPv4 address if testing on a physical device on the same network.
const getBaseUrl = () => {
    if (__DEV__) {
        // Change to your machine's local IP address if testing on a physical device, like 'http://192.168.1.5:5000/api'
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:5000/api';
        }
        return 'http://192.168.1.104:5000/api';
    }
    // Production URL
    return 'https://medicarefinal-7yor.onrender.com/api';
};

export const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to automatically inject the auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await storage.getItem('userToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Silently fail to let the request proceed without auth if token fetch fails
        }
        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // You can handle global 401 unauth errors here to auto-logout the user
        if (error.response?.status === 401) {
            console.log('Unauthorized request. Might need to clear token and redirect to login.');
        }
        return Promise.reject(error);
    }
);

export default api;
