import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Doctor from '../models/Doctor';
import PatientProfile from '../models/PatientProfile';
import Clinic from '../models/Clinic';
import Appointment from '../models/Appointment';
import Review from '../models/Review';
import connectDB from '../config/db';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Cleaning database...');
        await User.deleteMany();
        await Doctor.deleteMany();
        await PatientProfile.deleteMany();
        await Clinic.deleteMany();
        await Appointment.deleteMany();
        await Review.deleteMany();

        console.log('Seeding Users...');
        
        // 1. Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@medicare.com',
            password: 'password123',
            role: 'admin',
            isVerified: true
        });

        // 2. Create Doctors
        const doctorUsers = await User.create([
            { name: 'Dr. Sameer Mahadik', email: 'sameer@medicare.com', password: 'password123', role: 'doctor', isVerified: true },
            { name: 'Dr. Vikram Patel', email: 'vikram@medicare.com', password: 'password123', role: 'doctor', isVerified: true },
            { name: 'Dr. Meera Iyer', email: 'meera@medicare.com', password: 'password123', role: 'doctor', isVerified: true },
            { name: 'Dr. Rajesh Khanna', email: 'rajesh@medicare.com', password: 'password123', role: 'doctor', isVerified: true },
            { name: 'Dr. Priya Nair', email: 'priya@medicare.com', password: 'password123', role: 'doctor', isVerified: true }
        ]);

        const doctors = await Doctor.create([
            {
                user: doctorUsers[0]._id,
                name: doctorUsers[0].name,
                email: doctorUsers[0].email,
                specialization: 'Cardiologist',
                experience: '12 years',
                consultationFee: 500,
                rating: 4.9,
                avatar: 'https://ui-avatars.com/api/?name=SM&background=e0f2fe&color=0284c7',
                bio: 'Senior Cardiologist with specialized expertise in interventional cardiology and heart failure management.',
                education: ['MBBS - AIIMS Delhi', 'MD - Cardiology'],
                awards: ['Best Cardiologist 2023', 'Medical Excellence Award'],
                languages: ['English', 'Hindi', 'Marathi'],
                address: 'Heart Center, South Delhi'
            },
            {
                user: doctorUsers[1]._id,
                name: doctorUsers[1].name,
                email: doctorUsers[1].email,
                specialization: 'Dermatologist',
                experience: '8 years',
                consultationFee: 400,
                rating: 4.8,
                avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
                bio: 'Expert in clinical and cosmetic dermatology, specializing in skin rejuvenation and laser treatments.',
                education: ['MBBS', 'Diploma in Dermatology'],
                languages: ['English', 'Gujarati'],
                address: 'Skin Clinic, Gurugram'
            },
            {
                user: doctorUsers[2]._id,
                name: doctorUsers[2].name,
                email: doctorUsers[2].email,
                specialization: 'Pediatrician',
                experience: '15 years',
                consultationFee: 350,
                rating: 4.7,
                avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
                bio: 'Compassionate pediatrician focusing on child growth, development, and preventive care.',
                education: ['MBBS', 'DCH - Pediatrics'],
                awards: ['Child Care Hero Award'],
                languages: ['English', 'Hindi', 'Tamil'],
                address: 'Kido Clinic, Noida'
            }
        ]);

        // 3. Create Patients
        const patientUsers = await User.create([
            { name: 'Arjun Verma', email: 'arjun@gmail.com', password: 'password123', role: 'patient', isVerified: true },
            { name: 'Kavya Reddy', email: 'kavya@gmail.com', password: 'password123', role: 'patient', isVerified: true }
        ]);

        const patients = await PatientProfile.create([
            {
                user: patientUsers[0]._id,
                fullName: patientUsers[0].name,
                email: patientUsers[0].email,
                phone: '9876543210',
                vitals: { heartRate: '75 bpm', bloodPressure: '118/78', bloodSugar: '92 mg/dL', weight: '74 kg' }
            },
            {
                user: patientUsers[1]._id,
                fullName: patientUsers[1].name,
                email: patientUsers[1].email,
                phone: '9876543211',
                vitals: { heartRate: '68 bpm', bloodPressure: '110/70', bloodSugar: '88 mg/dL', weight: '58 kg' }
            }
        ]);

        // 4. Create Clinics
        const clinics = await Clinic.create([
            {
                name: 'MediCare Central Hospital',
                address: '12-B, Ring Road, Sector 4',
                city: 'New Delhi',
                phone: '011-23456789',
                specialties: ['Cardiology', 'Neurology', 'Pediatrics'],
                openingHours: '24/7'
            },
            {
                name: 'City Care Clinic',
                address: 'Shop 45, Market Extension',
                city: 'Gurugram',
                phone: '0124-9876541',
                specialties: ['Dermatology', 'General Medicine'],
                openingHours: '9:00 AM - 9:00 PM'
            }
        ]);

        // 5. Create Appointments
        await Appointment.create([
            {
                doctorName: doctors[0].name,
                patientName: patients[0].fullName,
                specialization: doctors[0].specialization,
                date: 'Mar 20',
                time: '10:30 AM',
                status: 'upcoming',
                type: 'In-Person',
                avatar: doctors[0].avatar,
                user: patientUsers[0]._id,
                doctorId: doctorUsers[0]._id
            },
            {
                doctorName: doctors[1].name,
                patientName: patients[1].fullName,
                specialization: doctors[1].specialization,
                date: 'Mar 18',
                time: '2:00 PM',
                status: 'completed',
                type: 'In-Person',
                avatar: doctors[1].avatar,
                user: patientUsers[1]._id,
                doctorId: doctorUsers[1]._id
            }
        ]);

        // 6. Create Reviews
        await Review.create([
            {
                doctorId: doctorUsers[0]._id,
                user: patientUsers[0]._id,
                rating: 5,
                comment: 'Excellent doctor! Very thorough and patient with my questions.'
            },
            {
                doctorId: doctorUsers[1]._id,
                user: patientUsers[1]._id,
                rating: 4,
                comment: 'Great dermatologist. The treatment worked wonders for my skin.'
            }
        ]);

        console.log('Seeding completed successfully! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
