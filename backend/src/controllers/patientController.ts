import { Request, Response } from 'express';
import PatientProfile from '../models/PatientProfile';
import User from '../models/User';

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

// @desc    Get all patients (doctor / admin only)
// @route   GET /api/patients
// @access  Private
export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const patients = await PatientProfile.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
