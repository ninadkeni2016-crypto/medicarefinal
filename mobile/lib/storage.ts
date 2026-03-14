import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * A resilient storage wrapper that handles cases where AsyncStorage 
 * native modules might not be fully initialized or fail on certain platforms.
 */
const storage = {
    async getItem(key: string): Promise<string | null> {
        try {
            // Basic check for web/legacy fallback
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }

            const value = await AsyncStorage.getItem(key);
            return value;
        } catch (e) {
            console.warn(`Storage.getItem failed for key: ${key}`, e);
            // Fallback to localStorage if applicable
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
                return;
            }

            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.warn(`Storage.setItem failed for key: ${key}`, e);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
                return;
            }

            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.warn(`Storage.removeItem failed for key: ${key}`, e);
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
        }
    },
};

export default storage;
