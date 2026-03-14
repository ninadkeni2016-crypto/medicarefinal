import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import User from '../models/User';

// @desc    Get all doctors (public)
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        const { specialization, search } = req.query;
        let query: any = { isAvailable: true };
        if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { specialization: { $regex: search, $options: 'i' } },
        ];
        const doctors = await Doctor.find(query).sort({ rating: -1 });
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (doctor) { res.json(doctor); }
        else { res.status(404).json({ message: 'Doctor not found' }); }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get own doctor profile (logged-in doctor)
// @route   GET /api/doctors/profile
// @access  Private
export const getOwnDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const doctor = await Doctor.findOne({ user: req.user._id });
        if (doctor) { res.json(doctor); }
        else { res.status(404).json({ message: 'Doctor profile not yet created.' }); }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (doctor only)
export const upsertDoctorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }

        const update = {
            user: req.user._id,
            name: user.name,
            email: user.email,
            ...req.body,
        };

        const doctor = await Doctor.findOneAndUpdate(
            { user: req.user._id },
            update,
            { new: true, upsert: true, runValidators: true }
        );
        res.json(doctor);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
