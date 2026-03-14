export type UserRole = 'doctor' | 'patient';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  distance: string;
  consultationFee: number;
  avatar: string;
  availableSlots: string[];
  experience: string;
  patients: number;
  reviews: number;
  bio?: string;
  education?: string[];
  awards?: string[];
  languages?: string[];
  address?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  specialization: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: 'In-Person' | 'Video Call';
  avatar: string;
}

export interface Prescription {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  notes: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'Blood Test' | 'X-Ray' | 'MRI' | 'Lab Report';
  date: string;
  doctorName: string;
  status: 'Ready' | 'Pending';
}

export interface Bill {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  consultationFee: number;
  treatmentCost: number;
  labCharges: number;
  medicineCost: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'report';
}

export const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sameer Mahadik', specialization: 'Cardiologist', rating: 4.9, distance: '1.2 km', consultationFee: 500, avatar: 'https://ui-avatars.com/api/?name=SM&background=e0f2fe&color=0284c7', availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM'], experience: '12 years', patients: 1240, reviews: 312, bio: 'Senior Cardiologist with specialized expertise in interventional cardiology and heart failure management.', education: ['MBBS - AIIMS Delhi', 'MD - Cardiology'], languages: ['English', 'Hindi', 'Marathi'] },
  { id: '2', name: 'Dr. Vikram Patel', specialization: 'Dermatologist', rating: 4.8, distance: '2.5 km', consultationFee: 400, avatar: 'https://randomuser.me/api/portraits/men/43.jpg', availableSlots: ['11:00 AM', '3:00 PM', '4:30 PM'], experience: '8 years', patients: 890, reviews: 205, bio: 'Expert in clinical and cosmetic dermatology, specializing in skin rejuvenation and laser treatments.', education: ['MBBS', 'Diploma in Dermatology'], languages: ['English', 'Gujarati'] },
  { id: '3', name: 'Dr. Meera Iyer', specialization: 'Pediatrician', rating: 4.7, distance: '3.1 km', consultationFee: 350, avatar: 'https://randomuser.me/api/portraits/women/68.jpg', availableSlots: ['8:00 AM', '1:00 PM'], experience: '15 years', patients: 2100, reviews: 489, bio: 'Compassionate pediatrician focusing on child growth, development, and preventive care.', education: ['MBBS', 'DCH - Pediatrics'], languages: ['English', 'Hindi', 'Tamil'] },
  { id: '4', name: 'Dr. Rajesh Khanna', specialization: 'Orthopedic', rating: 4.6, distance: '0.8 km', consultationFee: 600, avatar: 'https://randomuser.me/api/portraits/men/46.jpg', availableSlots: ['10:00 AM', '2:30 PM', '5:00 PM'], experience: '20 years', patients: 3200, reviews: 678, bio: 'Leading orthopedic surgeon with a focus on joint replacement and sports injuries.', education: ['MBBS', 'MS - Orthopedics'], languages: ['English', 'Hindi', 'Punjabi'] },
  { id: '5', name: 'Dr. Priya Nair', specialization: 'Neurologist', rating: 4.9, distance: '4.2 km', consultationFee: 700, avatar: 'https://randomuser.me/api/portraits/women/65.jpg', availableSlots: ['9:30 AM', '11:30 AM'], experience: '10 years', patients: 750, reviews: 198, bio: 'Dedicated neurologist specializing in neuro-muscular disorders and specialized migraine clinic.', education: ['MBBS', 'DM - Neurology'], languages: ['English', 'Malayalam', 'Hindi'] },
];

export const mockAppointments: Appointment[] = [
  { id: '1', doctorName: 'Dr. Sameer Mahadik', patientName: 'Arjun Verma', specialization: 'Cardiology', date: 'Mar 12, 2026', time: '10:30 AM', status: 'upcoming', type: 'In-Person', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: '2', doctorName: 'Dr. Vikram Patel', patientName: 'Kavya Reddy', specialization: 'Dermatology', date: 'Mar 10, 2026', time: '2:00 PM', status: 'completed', type: 'Video Call', avatar: 'https://randomuser.me/api/portraits/women/26.jpg' },
  { id: '3', doctorName: 'Dr. Meera Iyer', patientName: 'Rohan Gupta', specialization: 'Pediatrics', date: 'Mar 15, 2026', time: '9:00 AM', status: 'upcoming', type: 'In-Person', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: '4', doctorName: 'Dr. Rajesh Khanna', patientName: 'Sneha Joshi', specialization: 'Orthopedics', date: 'Mar 8, 2026', time: '11:00 AM', status: 'completed', type: 'In-Person', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { id: '5', doctorName: 'Dr. Priya Nair', patientName: 'Aditya Kumar', specialization: 'Neurology', date: 'Mar 20, 2026', time: '3:30 PM', status: 'upcoming', type: 'Video Call', avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
];

export const mockPrescriptions: Prescription[] = [
  { id: '1', doctorName: 'Dr. Sameer Mahadik', patientName: 'Arjun Verma', date: 'Mar 8, 2026', medicines: [{ name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' }], notes: 'Take after meals. Follow up in 2 weeks.' },
  { id: '2', doctorName: 'Dr. Vikram Patel', patientName: 'Kavya Reddy', date: 'Mar 5, 2026', medicines: [{ name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' }], notes: 'Avoid sun exposure. Apply sunscreen SPF 50.' },
];

export const mockReports: Report[] = [
  { id: '1', name: 'Complete Blood Count', type: 'Blood Test', date: 'Mar 6, 2026', doctorName: 'Dr. Sameer Mahadik', status: 'Ready' },
  { id: '2', name: 'Chest X-Ray', type: 'X-Ray', date: 'Mar 4, 2026', doctorName: 'Dr. Rajesh Khanna', status: 'Ready' },
  { id: '3', name: 'Brain MRI Scan', type: 'MRI', date: 'Mar 10, 2026', doctorName: 'Dr. Priya Nair', status: 'Pending' },
  { id: '4', name: 'Lipid Profile', type: 'Lab Report', date: 'Mar 2, 2026', doctorName: 'Dr. Sameer Mahadik', status: 'Ready' },
];

export const mockBills: Bill[] = [
  { id: '1', patientName: 'Arjun Verma', doctorName: 'Dr. Sameer Mahadik', date: 'Mar 8, 2026', consultationFee: 500, treatmentCost: 1200, labCharges: 800, medicineCost: 350, total: 2850, status: 'Pending' },
  { id: '2', patientName: 'Kavya Reddy', doctorName: 'Dr. Vikram Patel', date: 'Mar 5, 2026', consultationFee: 400, treatmentCost: 0, labCharges: 0, medicineCost: 150, total: 550, status: 'Paid' },
  { id: '3', patientName: 'Rohan Gupta', doctorName: 'Dr. Meera Iyer', date: 'Feb 28, 2026', consultationFee: 350, treatmentCost: 500, labCharges: 600, medicineCost: 200, total: 1650, status: 'Overdue' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: '1', sender: 'Dr. Sameer Mahadik', content: 'Hello! How are you feeling today?', time: '10:30 AM', isOwn: false, type: 'text' },
  { id: '2', sender: 'You', content: 'Hi Doctor! I have been feeling much better after the medication.', time: '10:32 AM', isOwn: true, type: 'text' },
  { id: '3', sender: 'Dr. Sameer Mahadik', content: 'That\'s great to hear! Have you been monitoring your blood pressure regularly?', time: '10:33 AM', isOwn: false, type: 'text' },
  { id: '4', sender: 'You', content: 'Yes, it\'s been around 120/80 consistently.', time: '10:35 AM', isOwn: true, type: 'text' },
  { id: '5', sender: 'Dr. Sameer Mahadik', content: 'Excellent! That\'s well within the normal range. Keep up the good work and continue the medication for the prescribed duration.', time: '10:36 AM', isOwn: false, type: 'text' },
];
