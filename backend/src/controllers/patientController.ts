import { Request, Response } from 'express';
import PatientProfile from '../models/PatientProfile';
import User from '../models/User';
import { isDemoMode } from '../config/demoMode';
import { demoPatients } from '../data/demoData';
import Patient from '../models/Patient';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get own patient profile
// @route   GET /api/patients/profile
// @access  Private
export const getPatientProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        let profile = await PatientProfile.findOne({ user: req.user._id });
        if (!profile) {
            const user = await User.findById(req.user._id);
            profile = new PatientProfile({ user: req.user._id, fullName: user?.name || '', email: user?.email || '' });
            await profile.save();
        }
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private
export const updatePatientProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const profile = await PatientProfile.findOneAndUpdate(
            { user: req.user._id },
            { ...req.body, user: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );
        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all patients (doctor / admin only). Returns demo data when DEMO_MODE=true.
// @route   GET /api/patients
// @access  Private
export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (isDemoMode()) {
            res.setHeader('X-Demo-Data', 'true');
            res.json(demoPatients);
            return;
        }
        let patients = await PatientProfile.find().sort({ createdAt: -1 }).lean();
        if (patients.length === 0) {
            res.setHeader('X-Demo-Data', 'true');
            res.json(demoPatients);
            return;
        }
        const withExtras = patients.map((p: any) => ({
            ...p,
            fullName: p.fullName || p.email?.split('@')[0] || 'Patient',
            lastVisit: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : undefined,
            condition: p.chronicConditions || 'Stable',
        }));
        res.json(withExtras);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all custom patients for a doctor
// @route   GET /api/patients/doctor
// @access  Private (Doctor)
export const getDoctorPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const patients = await Patient.find({ doctorId: req.user._id }).sort({ createdAt: -1 });
        res.json(patients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single custom patient
// @route   GET /api/patients/doctor/:id
// @access  Private (Doctor)
export const getDoctorPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            if (patient.doctorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create custom patient record
// @route   POST /api/patients/doctor
// @access  Private (Doctor)
export const createDoctorPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, phone, gender, age, status, lastVisit } = req.body;
        const patient = new Patient({
            name, phone, gender, age,
            status: status || 'stable',
            lastVisit: lastVisit || new Date(),
            doctorId: req.user._id,
        });
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update custom patient record
// @route   PATCH /api/patients/doctor/:id
// @access  Private (Doctor)
export const updateDoctorPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            if (patient.doctorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401).json({ message: 'Not authorized' });
                return;
            }
            if (req.body.name) patient.name = req.body.name;
            if (req.body.phone) patient.phone = req.body.phone;
            if (req.body.gender) patient.gender = req.body.gender;
            if (req.body.age !== undefined) patient.age = req.body.age;
            if (req.body.status) patient.status = req.body.status;
            if (req.body.lastVisit) patient.lastVisit = req.body.lastVisit;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
