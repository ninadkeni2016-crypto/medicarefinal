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
  {
    id: '1', name: 'Dr. Sameer Mahadik', specialization: 'Cardiologist', rating: 4.9,
    distance: '1.2 km', consultationFee: 500, avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '4:00 PM'], experience: '12 years', patients: 1240, reviews: 312,
    bio: 'Senior Cardiologist with specialized expertise in interventional cardiology and heart failure management.',
    education: ['MBBS - AIIMS Delhi', 'MD - Cardiology, PGI Chandigarh'], languages: ['English', 'Hindi', 'Marathi'],
    address: 'Apollo Hospital, Andheri West, Mumbai',
  },
  {
    id: '2', name: 'Dr. Vikram Patel', specialization: 'Dermatologist', rating: 4.8,
    distance: '2.5 km', consultationFee: 400, avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    availableSlots: ['11:00 AM', '3:00 PM', '4:30 PM'], experience: '8 years', patients: 890, reviews: 205,
    bio: 'Expert in clinical and cosmetic dermatology, specializing in skin rejuvenation and laser treatments.',
    education: ['MBBS - BJ Medical College', 'Diploma in Dermatology - Mumbai'], languages: ['English', 'Gujarati', 'Hindi'],
    address: 'Skin Care Clinic, Bandra, Mumbai',
  },
  {
    id: '3', name: 'Dr. Meera Iyer', specialization: 'Pediatrician', rating: 4.7,
    distance: '3.1 km', consultationFee: 350, avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    availableSlots: ['8:00 AM', '10:00 AM', '1:00 PM', '3:30 PM'], experience: '15 years', patients: 2100, reviews: 489,
    bio: 'Compassionate pediatrician focusing on child growth, development, and preventive care.',
    education: ['MBBS - KEM Hospital', 'DCH - Pediatrics, LTMG Hospital'], languages: ['English', 'Hindi', 'Tamil'],
    address: 'Rainbow Children Hospital, Powai, Mumbai',
  },
  {
    id: '4', name: 'Dr. Rajesh Khanna', specialization: 'Orthopedic', rating: 4.6,
    distance: '0.8 km', consultationFee: 600, avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    availableSlots: ['10:00 AM', '12:00 PM', '2:30 PM', '5:00 PM'], experience: '20 years', patients: 3200, reviews: 678,
    bio: 'Leading orthopedic surgeon with a focus on joint replacement, spine surgery, and sports injuries.',
    education: ['MBBS - Grant Medical College', 'MS - Orthopedics, AIIMS'], languages: ['English', 'Hindi', 'Punjabi'],
    address: 'Kokilaben Hospital, Andheri, Mumbai',
  },
  {
    id: '5', name: 'Dr. Priya Nair', specialization: 'Neurologist', rating: 4.9,
    distance: '4.2 km', consultationFee: 700, avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    availableSlots: ['9:30 AM', '11:30 AM', '2:00 PM'], experience: '10 years', patients: 750, reviews: 198,
    bio: 'Dedicated neurologist specializing in neuro-muscular disorders and a specialized migraine clinic.',
    education: ['MBBS - JIPMER Puducherry', 'DM - Neurology, NIMHANS'], languages: ['English', 'Malayalam', 'Hindi'],
    address: 'Nanavati Hospital, Vile Parle, Mumbai',
  },
  {
    id: '6', name: 'Dr. Ananya Sharma', specialization: 'Gynecologist', rating: 4.8,
    distance: '1.9 km', consultationFee: 550, avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    availableSlots: ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'], experience: '14 years', patients: 1850, reviews: 422,
    bio: 'Experienced gynecologist & obstetrician specializing in high-risk pregnancies, PCOS management, and minimal-access surgery.',
    education: ['MBBS - Maulana Azad Medical College', 'MD - Obstetrics & Gynecology'], languages: ['English', 'Hindi'],
    address: 'Lilavati Hospital, Bandra West, Mumbai',
  },
  {
    id: '7', name: 'Dr. Suresh Babu', specialization: 'Endocrinologist', rating: 4.7,
    distance: '3.5 km', consultationFee: 650, avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    availableSlots: ['10:00 AM', '12:30 PM', '4:00 PM'], experience: '11 years', patients: 980, reviews: 256,
    bio: 'Specialist in diabetes management, thyroid disorders, adrenal diseases, and metabolic syndrome.',
    education: ['MBBS - Stanley Medical College', 'DM - Endocrinology, SGPGI'], languages: ['English', 'Tamil', 'Telugu'],
    address: 'Wockhardt Hospital, Mulund, Mumbai',
  },
  {
    id: '8', name: 'Dr. Neha Kulkarni', specialization: 'Psychiatrist', rating: 4.6,
    distance: '2.0 km', consultationFee: 600, avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    availableSlots: ['10:00 AM', '12:00 PM', '3:00 PM', '5:30 PM'], experience: '9 years', patients: 620, reviews: 183,
    bio: 'Compassionate psychiatrist with expertise in anxiety, depression, OCD, and adolescent mental health.',
    education: ['MBBS - Lokmanya Tilak Municipal Medical College', 'MD - Psychiatry, NIMHANS'], languages: ['English', 'Hindi', 'Marathi'],
    address: 'Fortis Hospital, Kalyan, Mumbai',
  },
  {
    id: '9', name: 'Dr. Arjun Mehta', specialization: 'Ophthalmologist', rating: 4.8,
    distance: '1.5 km', consultationFee: 450, avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    availableSlots: ['8:30 AM', '10:30 AM', '2:00 PM', '4:30 PM'], experience: '13 years', patients: 1580, reviews: 367,
    bio: 'Cataract and LASIK expert with advanced training in retinal disorders and paediatric ophthalmology.',
    education: ['MBBS - Seth GS Medical College', 'MS - Ophthalmology, AIIMS'], languages: ['English', 'Hindi', 'Gujarati'],
    address: 'Eye Care Centre, Juhu, Mumbai',
  },
  {
    id: '10', name: 'Dr. Kavitha Reddy', specialization: 'Pulmonologist', rating: 4.7,
    distance: '2.8 km', consultationFee: 600, avatar: 'https://randomuser.me/api/portraits/women/38.jpg',
    availableSlots: ['9:00 AM', '11:00 AM', '3:30 PM'], experience: '10 years', patients: 830, reviews: 212,
    bio: 'Expert in asthma, COPD, sleep apnea, and critical care pulmonology with advanced bronchoscopy skills.',
    education: ['MBBS - Osmania Medical College', 'MD - Pulmonology, AIIMS Delhi'], languages: ['English', 'Telugu', 'Hindi'],
    address: 'Hinduja Hospital, Mahim, Mumbai',
  },
  {
    id: '11', name: 'Dr. Rohit Desai', specialization: 'Gastroenterologist', rating: 4.9,
    distance: '3.7 km', consultationFee: 700, avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    availableSlots: ['10:30 AM', '1:00 PM', '4:00 PM'], experience: '16 years', patients: 2200, reviews: 534,
    bio: 'Senior gastroenterologist specializing in endoscopy, inflammatory bowel disease, and liver diseases.',
    education: ['MBBS - KEM Hospital', 'DM - Gastroenterology, SGPG Institute'], languages: ['English', 'Hindi', 'Marathi'],
    address: 'Breach Candy Hospital, Cumballa Hill, Mumbai',
  },
  {
    id: '12', name: 'Dr. Sunita Joshi', specialization: 'Oncologist', rating: 4.8,
    distance: '5.0 km', consultationFee: 900, avatar: 'https://randomuser.me/api/portraits/women/60.jpg',
    availableSlots: ['9:00 AM', '11:30 AM', '2:30 PM'], experience: '18 years', patients: 1100, reviews: 298,
    bio: 'Medical oncologist specializing in breast cancer, lung cancer, haematological malignancies, and immunotherapy.',
    education: ['MBBS - Topiwala National Medical College', 'DM - Medical Oncology, Tata Memorial Hospital'], languages: ['English', 'Hindi', 'Marathi'],
    address: 'Tata Memorial Hospital, Parel, Mumbai',
  },
  {
    id: '13', name: 'Dr. Kiran Kumar', specialization: 'Urologist', rating: 4.6,
    distance: '2.2 km', consultationFee: 650, avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    availableSlots: ['8:00 AM', '10:00 AM', '1:30 PM', '3:30 PM'], experience: '14 years', patients: 1350, reviews: 321,
    bio: 'Urologist skilled in laparoscopic and robotic urological surgeries, kidney stone management, and prostate care.',
    education: ['MBBS - Kasturba Medical College', 'MS - Urology, AIIMS New Delhi'], languages: ['English', 'Kannada', 'Hindi'],
    address: 'Global Hospitals, Parel, Mumbai',
  },
  {
    id: '14', name: 'Dr. Deepa Menon', specialization: 'Dermatologist', rating: 4.7,
    distance: '1.8 km', consultationFee: 400, avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    availableSlots: ['9:30 AM', '12:00 PM', '4:00 PM', '6:00 PM'], experience: '7 years', patients: 740, reviews: 189,
    bio: 'Trained in medical and aesthetic dermatology with focus on pigmentation, acne treatment, and anti-aging procedures.',
    education: ['MBBS - Government Medical College Calicut', 'MD - Dermatology, JIPMER'], languages: ['English', 'Malayalam', 'Hindi'],
    address: 'Skin & Smile Clinic, Chembur, Mumbai',
  },
  {
    id: '15', name: 'Dr. Aditya Bose', specialization: 'Cardiologist', rating: 4.8,
    distance: '4.5 km', consultationFee: 800, avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
    availableSlots: ['8:00 AM', '10:00 AM', '3:00 PM'], experience: '22 years', patients: 4100, reviews: 856,
    bio: 'Pioneer in catheterization lab procedures, electrophysiology, and preventive cardiac health programs.',
    education: ['MBBS - RG Kar Medical College Kolkata', 'MD - Cardiology, AIIMS', 'DM - Interventional Cardiology, Escorts Heart Institute'], languages: ['English', 'Bengali', 'Hindi'],
    address: 'Asian Heart Institute, Bandra, Mumbai',
  },
  {
    id: '16', name: 'Dr. Shalini Rao', specialization: 'Pediatrician', rating: 4.9,
    distance: '0.6 km', consultationFee: 380, avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
    availableSlots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:30 PM'], experience: '12 years', patients: 1760, reviews: 415,
    bio: 'Child-friendly pediatrician specialized in neonatology, childhood vaccinations, and developmental assessments.',
    education: ['MBBS - Manipal College of Medical Sciences', 'MD - Pediatrics, AIIMS'], languages: ['English', 'Kannada', 'Hindi', 'Marathi'],
    address: 'Surya Mother & Child Superspecialty Hospital, Santacruz, Mumbai',
  },
  {
    id: '17', name: 'Dr. Manish Tiwari', specialization: 'General Medicine', rating: 4.5,
    distance: '0.4 km', consultationFee: 250, avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
    availableSlots: ['8:00 AM', '9:30 AM', '11:30 AM', '2:00 PM', '4:00 PM', '6:00 PM'], experience: '6 years', patients: 2850, reviews: 642,
    bio: 'General physician dedicated to preventive care, chronic disease management, and family health consultations.',
    education: ['MBBS - Patna Medical College', 'DNB - General Medicine'], languages: ['English', 'Hindi', 'Bhojpuri'],
    address: 'Medanta Clinic, Goregaon East, Mumbai',
  },
  {
    id: '18', name: 'Dr. Pooja Gupta', specialization: 'Gynecologist', rating: 4.7,
    distance: '2.3 km', consultationFee: 500, avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    availableSlots: ['10:00 AM', '12:00 PM', '3:30 PM', '5:30 PM'], experience: '11 years', patients: 1420, reviews: 339,
    bio: 'Gynecologist with expertise in infertility treatment, IVF support, laparoscopic surgery, and menopause management.',
    education: ['MBBS - Maulana Azad Medical College', 'MS - Obstetrics & Gynecology, MAMC Delhi'], languages: ['English', 'Hindi'],
    address: 'Motherhood Hospital, Kharghar, Navi Mumbai',
  },
  {
    id: '19', name: 'Dr. Sanjay Tripathi', specialization: 'Orthopedic', rating: 4.6,
    distance: '6.1 km', consultationFee: 550, avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    availableSlots: ['9:00 AM', '11:00 AM', '2:00 PM'], experience: '17 years', patients: 2700, reviews: 590,
    bio: 'Orthopedic surgeon specializing in arthroscopic knee and shoulder surgeries, fracture management, and physiotherapy.',
    education: ['MBBS - King George Medical University Lucknow', 'MS - Orthopedics, PGI'], languages: ['English', 'Hindi'],
    address: 'Hiranandani Hospital, Powai, Mumbai',
  },
  {
    id: '20', name: 'Dr. Fatima Sheikh', specialization: 'Neurologist', rating: 4.8,
    distance: '3.0 km', consultationFee: 750, avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
    availableSlots: ['10:00 AM', '1:00 PM', '4:30 PM'], experience: '13 years', patients: 960, reviews: 231,
    bio: 'Neurologist with sub-specialization in stroke management, epilepsy, headache disorders, and movement diseases.',
    education: ['MBBS - Government Medical College Nagpur', 'MD - Medicine', 'DM - Neurology, SGPGI Lucknow'], languages: ['English', 'Hindi', 'Urdu'],
    address: 'Sir HN Reliance Foundation Hospital, Girgaon, Mumbai',
  },
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
