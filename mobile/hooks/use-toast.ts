import { Alert } from 'react-native';

export const toast = ({ title, description, variant }: { title: string; description?: string; variant?: string }) => {
    Alert.alert(title, description || '');
};
