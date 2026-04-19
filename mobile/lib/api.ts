import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import storage from './storage';

// Dynamically detect the machine's local IP address during development.
// This ensures that the app always connects to the correct backend IP even if it changes.
const getBaseUrl = () => {
    if (__DEV__) {
        const debuggerHost = Constants.expoConfig?.hostUri;
        const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
        
        // For Android emulators specifically, 10.0.2.2 is usually required
        if (Platform.OS === 'android' && localhost === 'localhost') {
            return 'http://10.0.2.2:5000/api';
        }
        
        return `http://${localhost}:5000/api`;
    }
    // Production URL
    return 'https://medicarefinal-1nd3.vercel.app/api';
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
