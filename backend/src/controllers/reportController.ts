import { Request, Response } from 'express';
import Report from '../models/Report';

// @desc    Get user's reports
// @route   GET /api/reports
// @access  Private
export const getReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req: Request, res: Response): Promise<void> => {
    const { name, type, date, doctorName, status } = req.body;

    try {
        const report = new Report({
            user: req.user._id,
            name,
            type,
            date,
            doctorName,
            status: status || 'Pending',
        });

        const createdReport = await report.save();
        res.status(201).json(createdReport);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
