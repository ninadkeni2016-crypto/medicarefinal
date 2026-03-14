/**
 * Web-specific storage implementation.
 * 
 * This file (storage.web.ts) is automatically picked up by the Metro bundler
 * ONLY when building for the web. It completely bypasses the native AsyncStorage
 * module, which currently has a known bug in its web implementation in newer versions
 * ("Unable to resolve ../AsyncStorageError.js").
 * 
 * By using standard localStorage here, the web bundle compiles perfectly.
 */
const storage = {
    async getItem(key: string): Promise<string | null> {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
            return null;
        } catch (e) {
            console.warn(`localStorage.getItem failed for key: ${key}`, e);
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn(`localStorage.setItem failed for key: ${key}`, e);
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn(`localStorage.removeItem failed for key: ${key}`, e);
        }
    },
};

export default storage;
