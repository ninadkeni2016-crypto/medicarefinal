import { Request, Response } from 'express';
import PatientProfile from '../models/PatientProfile';
import User from '../models/User';
import { isDemoMode } from '../config/demoMode';
import { demoPatients } from '../data/demoData';

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
