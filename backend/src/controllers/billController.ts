import { Request, Response } from 'express';
import Bill from '../models/Bill';
import Notification from '../models/Notification';

// @desc    Get user's bills
// @route   GET /api/bills
// @access  Private
export const getBills = async (req: Request, res: Response): Promise<void> => {
    try {
        const bills = await Bill.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(bills);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
export const createBill = async (req: Request, res: Response): Promise<void> => {
    const { patientName, doctorName, date, consultationFee, treatmentCost, labCharges, medicineCost, total, status } = req.body;
    try {
        const bill = await Bill.create({
            user: req.user._id,
            patientName,
            doctorName,
            date,
            consultationFee: consultationFee || 0,
            treatmentCost: treatmentCost || 0,
            labCharges: labCharges || 0,
            medicineCost: medicineCost || 0,
            total: total || 0,
            status: status || 'Pending',
        });

        // Create Notification (non-blocking)
        Notification.create({
            user: req.user._id,
            title: 'New Bill Generated',
            body: `A new bill of ₹${total || 0} has been generated for your recent visit.`,
            type: 'billing'
        }).catch(err => console.error('Notification failed:', err));

        res.status(201).json(bill);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

