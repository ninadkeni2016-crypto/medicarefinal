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
import Conversation from '../models/Conversation';

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

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const todayAppointments = appointments.filter(
      (a: any) => (a.date === todayStr || a.date === 'Today') && ['upcoming', 'confirmed', 'rescheduled'].includes(a.status)
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

    // Security Fix: Extract unique patients from doctor's appointments
    const doctorAppointments = await Appointment.find({ 
        $or: [{ doctorId }, { doctorEmail: req.user?.email }] 
    }).select('user');
    const patientUserIds = [...new Set(doctorAppointments.map(a => a.user.toString()))];

    const [patients, appointments, notifications, reports, conversations] = await Promise.all([
      PatientProfile.find({ user: { $in: patientUserIds } }).sort({ updatedAt: -1 }).limit(5).lean(),
      Appointment.find({ $or: [{ doctorId }, { doctorEmail: req.user?.email }], status: 'upcoming' }).sort({ date: 1, time: 1 }).limit(5).lean(),
      Notification.find({ user: doctorId }).sort({ createdAt: -1 }).limit(10).lean(),
      Report.find({}).sort({ createdAt: -1 }).limit(4).lean(),
      Conversation.find({ participants: doctorId }).sort({ lastMessageTime: -1, updatedAt: -1 }).limit(3).lean(),
    ]);

    const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const allAppointments = await Appointment.find({ $or: [{ doctorId }, { doctorEmail: req.user?.email }] }).lean();
    
    const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    allAppointments.forEach((app: any) => {
        let d = new Date();
        if (app.date !== 'Today' && app.date !== 'Tomorrow' && app.date) {
            let parsed = new Date(app.date);
            if (isNaN(parsed.getTime())) {
                parsed = new Date(`${app.date} ${new Date().getFullYear()}`);
            }
            if (!isNaN(parsed.getTime())) d = parsed;
        } else if (app.date === 'Tomorrow') {
            d.setDate(d.getDate() + 1);
        }
        
        const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayStr = dayMap[d.getDay()];
        if (dayCounts[dayStr as keyof typeof dayCounts] !== undefined) {
             dayCounts[dayStr as keyof typeof dayCounts]++;
        }
    });

    const appointmentsPerWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      count: dayCounts[day as keyof typeof dayCounts],
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
          status: { $in: ['upcoming', 'confirmed', 'rescheduled'] },
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
      messages: conversations.map((c: any) => {
          // Identify the other participant's name
          let otherName = 'Patient';
          if (c.participantNames && c.participantNames.length === 2) {
              const myNameIndex = c.participants.findIndex((p: any) => p.toString() === doctorId.toString());
              if (myNameIndex !== -1 && c.participantNames[myNameIndex === 0 ? 1 : 0]) {
                  otherName = c.participantNames[myNameIndex === 0 ? 1 : 0];
              } else {
                  // Fallback if not found correctly
                  otherName = c.participantNames.find((n: string) => n && n !== req.user?.name) || 'Patient';
              }
          }
          return {
              _id: c._id,
              participantName: otherName,
              lastMessage: c.lastMessage || 'Start a conversation',
              unreadCount: c.unreadCount || 0
          };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
