import { Request, Response } from 'express';
import Prescription from '../models/Prescription';
import { sendPrescriptionEmail } from '../utils/sendEmail';
import Notification from '../models/Notification';

// @desc    Get user's prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private
export const createPrescription = async (req: Request, res: Response): Promise<void> => {
    const { doctorName, patientName, date, medicines, notes, patientEmail } = req.body;

    try {
        const prescription = new Prescription({
            user: req.user._id,
            doctorName,
            patientName,
            date,
            medicines,
            notes,
        });

        const createdPrescription = await prescription.save();

        // Create Notification (non-blocking)
        Notification.create({
            user: req.user._id,
            title: 'New Prescription',
            body: `A new prescription has been issued by Dr. ${doctorName}.`,
            type: 'prescription'
        }).catch(err => console.error('Notification failed:', err));

        // Send prescription email (non-blocking)
        const emailTo = patientEmail || req.user.email;
        if (emailTo) {
            sendPrescriptionEmail(emailTo, { patientName, doctorName, date, medicines, notes })
                .catch(err => console.error('Prescription email failed:', err));
        }

        res.status(201).json(createdPrescription);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
