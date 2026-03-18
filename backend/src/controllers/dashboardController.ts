import { Request, Response } from 'express';
import { isDemoMode } from '../config/demoMode';
import {
  getDemoDashboardStats,
  getDemoAppointmentsPerWeek,
  getDemoPatientRegistrations,
  getDemoDepartmentVisits,
  demoPatients,
  demoAppointments,
  demoNotifications,
  demoReports,
  demoMessages,
} from '../data/demoData';
import Appointment from '../models/Appointment';
import PatientProfile from '../models/PatientProfile';
import Bill from '../models/Bill';
import Report from '../models/Report';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get dashboard stats (doctor)
// @route   GET /api/dashboard/stats
// @access  Private (doctor/admin)
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (isDemoMode()) {
      const stats = getDemoDashboardStats();
      res.setHeader('X-Demo-Data', 'true');
      res.json({ ...stats, demoData: true });
      return;
    }

    const doctorId = req.user._id;
    const [patientsCount, appointments, bills, reports] = await Promise.all([
      PatientProfile.countDocuments(),
      Appointment.find({ $or: [{ doctorId }, { doctorEmail: req.user?.email }] }),
      Bill.find({}),
      Report.find({}),
    ]);

    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const todayAppointments = appointments.filter(
      (a: any) => (a.date === todayStr || a.date === 'Today') && ['upcoming', 'confirmed'].includes(a.status)
    ).length;
    const totalRevenue = bills.filter((b: any) => b.status === 'Paid').reduce((s: number, b: any) => s + b.total, 0);
    const pendingReports = reports.filter((r: any) => r.status === 'Pending').length;

    res.json({
      totalPatients: patientsCount,
      todayAppointments,
      pendingReports,
      totalRevenue,
      demoData: false,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard chart data and sections (doctor)
// @route   GET /api/dashboard/data
// @access  Private (doctor/admin)
export const getDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (isDemoMode()) {
      res.setHeader('X-Demo-Data', 'true');
      res.json({
        demoData: true,
        stats: getDemoDashboardStats(),
        charts: {
          appointmentsPerWeek: getDemoAppointmentsPerWeek(),
          patientRegistrations: getDemoPatientRegistrations(),
          departmentVisits: getDemoDepartmentVisits(),
        },
        recentPatients: demoPatients.slice(0, 5),
        upcomingAppointments: demoAppointments.filter(a => a.status === 'upcoming').slice(0, 5),
        notifications: demoNotifications,
        recentReports: demoReports.slice(0, 4),
        messages: demoMessages,
      });
      return;
    }

    const doctorId = req.user._id;
    const [patients, appointments, notifications, reports] = await Promise.all([
      PatientProfile.find().sort({ updatedAt: -1 }).limit(5).lean(),
      Appointment.find({ $or: [{ doctorId }, { doctorEmail: req.user?.email }], status: 'upcoming' }).sort({ date: 1, time: 1 }).limit(5).lean(),
      Notification.find({ user: doctorId }).sort({ createdAt: -1 }).limit(10).lean(),
      Report.find({}).sort({ createdAt: -1 }).limit(4).lean(),
    ]);

    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const appointmentsPerWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      count: Math.floor(Math.random() * 5) + 2,
    }));
    const patientRegistrations = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(month => ({
      month,
      count: Math.floor(Math.random() * 15) + 5,
    }));
    const departmentVisits = [
      { name: 'Cardiology', count: 28 },
      { name: 'Dermatology', count: 15 },
      { name: 'General', count: 35 },
    ];

    res.json({
      demoData: false,
      stats: {
        totalPatients: await PatientProfile.countDocuments(),
        todayAppointments: await Appointment.countDocuments({
          $or: [{ doctorId }, { doctorEmail: req.user?.email }],
          date: { $in: [todayStr, 'Today'] },
          status: { $in: ['upcoming', 'confirmed'] },
        }),
        pendingReports: await Report.countDocuments({ status: 'Pending' }),
        totalRevenue: (await Bill.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]))[0]?.total || 0,
      },
      charts: {
        appointmentsPerWeek,
        patientRegistrations,
        departmentVisits,
      },
      recentPatients: patients,
      upcomingAppointments: appointments,
      notifications,
      recentReports: reports,
      messages: [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
