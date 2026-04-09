import { Request, Response } from 'express';
import Waitlist from '../models/Waitlist';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Add user to waitlist for a doctor/date
// @route   POST /api/waitlist
// @access  Private
export const addToWaitlist = async (req: AuthRequest, res: Response): Promise<void> => {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
        res.status(400).json({ message: 'doctorId and date are required' });
        return;
    }

    try {
        const existing = await Waitlist.findOne({
            doctorId,
            patientId: req.user?._id,
            date,
            status: 'active'
        });

        if (existing) {
            res.status(400).json({ message: 'You are already on the waitlist for this day.' });
            return;
        }

        const waitlistItem = await Waitlist.create({
            doctorId,
            patientId: req.user?._id,
            date,
            status: 'active'
        });

        res.status(201).json(waitlistItem);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's active waitlists
// @route   GET /api/waitlist
// @access  Private
export const getMyWaitlists = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const waitlists = await Waitlist.find({
            patientId: req.user?._id,
            status: 'active'
        }).populate('doctorId', 'name specialization');

        res.json(waitlists);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
