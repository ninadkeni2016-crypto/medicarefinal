import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import Payment from '../models/Payment';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ message: 'Not authorized as admin' });
            return;
        }

        const totalUsers = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await Doctor.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        
        // Sum of all successful payments
        const payments = await Payment.find({ status: 'success' });
        const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

        res.json({
            users: totalUsers,
            doctors: totalDoctors,
            appointments: totalAppointments,
            revenue
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Not authorized as admin' }); return; }
        const users = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
export const getAllDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Not authorized as admin' }); return; }
        const doctors = await Doctor.find().populate('user', '-password').sort({ createdAt: -1 });
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Not authorized as admin' }); return; }
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'admin') { res.status(403).json({ message: 'Not authorized as admin' }); return; }
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
