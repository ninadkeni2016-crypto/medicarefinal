import React, { createContext, useContext, useState, ReactNode } from 'react';
import storage from '../lib/storage';
import api from '../lib/api';
import { UserRole } from '@/lib/mock-data';

export interface PatientProfile {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  height: string;
  weight: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastSurgeries: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  vitals?: {
    heartRate: string;
    bloodPressure: string;
    bloodSugar: string;
    weight: string;
  };
}

export const emptyProfile: PatientProfile = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  height: '',
  weight: '',
  address: '',
  city: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
  chronicConditions: '',
  currentMedications: '',
  pastSurgeries: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  vitals: {
    heartRate: '72 bpm',
    bloodPressure: '120/80',
    bloodSugar: '95 mg/dL',
    weight: '70 kg',
  },
};

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole | null;
  userName: string;
  patientProfile: PatientProfile;
  isProfileComplete: boolean;
  updatePatientProfile: (profile: PatientProfile) => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  login: (role: UserRole, emailStr: string, passwordStr: string) => Promise<{ success: boolean; message: string; needsVerification?: boolean; email?: string; code?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(emptyProfile);

  const isProfileComplete = patientProfile.fullName.trim() !== '';
  const userName = patientProfile.fullName || 'New Patient';

  const updatePatientProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      if (response.data && response.data.token) {
        await storage.setItem('userToken', response.data.token);
        setRole(response.data.role);
        setIsLoggedIn(true);
        setPatientProfile({ ...emptyProfile, fullName: response.data.name, email: response.data.email });
        return true;
      }
      return false;
    } catch (error) {
      console.error('OTP verification failed', error);
      return false;
    }
  };

  const login = async (selectedRole: UserRole, emailStr: string, passwordStr: string): Promise<{ success: boolean; message: string; needsVerification?: boolean; email?: string; code?: string }> => {
    try {
      const response = await api.post('/auth/login', { email: emailStr, password: passwordStr });
      if (response.data && response.data.token) {
        await storage.setItem('userToken', response.data.token);
        setRole(response.data.role || selectedRole);
        setIsLoggedIn(true);
        setPatientProfile({ ...emptyProfile, fullName: response.data.name, email: response.data.email });
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      if (!error.response) {
        return { success: false, message: 'Network error. Cannot connect to the server.' };
      }
      const msg = error.response.data?.message;
      const code = error.response.data?.code;

      if (msg === 'EMAIL_NOT_VERIFIED') {
        return { success: false, message: 'Please verify your email first.', needsVerification: true, email: error.response.data.email };
      }
      if (code === 'USER_NOT_FOUND') {
        return { success: false, message: 'User not found. Please sign up first.', code };
      }
      return { success: false, message: msg || 'Invalid email or password', code };
    }
  };

  const logout = async () => {
    await storage.removeItem('userToken');
    setIsLoggedIn(false);
    setRole(null);
    setPatientProfile(emptyProfile);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, userName, patientProfile, isProfileComplete, updatePatientProfile, register, verifyOTP, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
