import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Doctor from '../models/Doctor';
import { sendAppointmentConfirmationEmail, sendCancellationEmail } from '../utils/sendEmail';
import Notification from '../models/Notification';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { isDemoMode } from '../config/demoMode';
import { demoAppointments } from '../data/demoData';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get appointments. Returns demo data when DEMO_MODE=true.
//          - Patient: sees their own booked appointments
//          - Doctor:  sees appointments booked for them
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (isDemoMode()) {
            res.setHeader('X-Demo-Data', 'true');
            if (req.user?.role === 'doctor') {
                res.json(demoAppointments);
                return;
            }
            res.json(demoAppointments.slice(0, 3));
            return;
        }

        let appointments: any[];

        if (req.user?.role === 'doctor') {
            const doctorProfile = await Doctor.findOne({ user: req.user._id });
            const doctorName = doctorProfile?.name || req.user?.name || '';

            appointments = await Appointment.find({
                $or: [
                    { doctorId: req.user._id },
                    { doctorEmail: req.user.email },
                    ...(doctorName ? [{ doctorName: { $regex: `^${doctorName}$`, $options: 'i' } }] : []),
                ],
            }).sort({ createdAt: -1 });
        } else {
            appointments = await Appointment.find({ user: req.user?._id }).sort({ createdAt: -1 });
        }

        if (appointments.length === 0) {
            res.setHeader('X-Demo-Data', 'true');
            if (req.user?.role === 'doctor') {
                res.json(demoAppointments);
                return;
            }
            res.json(demoAppointments.slice(0, 3));
            return;
        }

        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    const {
        doctorName, patientName, specialization,
        date, time, status, type, avatar,
        patientEmail, notes,
        doctorId: bodyDoctorId,
    } = req.body;

    try {
        // Resolve the doctor's User account to link the appointment
        // Priority: 1) Find Doctor profile by frontend docId to get user ID, 2) look up Doctor profile by name
        let resolvedDoctorId = null;
        let resolvedDoctorEmail = '';

        if (bodyDoctorId) {
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bodyDoctorId);
            if (isValidObjectId) {
                const doctorProfile = await Doctor.findById(bodyDoctorId).catch(() => null);
                if (doctorProfile && doctorProfile.user) {
                    resolvedDoctorId = doctorProfile.user;
                } else {
                    resolvedDoctorId = bodyDoctorId;
                }
                const doctorUser = await User.findById(resolvedDoctorId).select('email').catch(() => null);
                resolvedDoctorEmail = doctorUser?.email || '';
            } else {
                resolvedDoctorId = bodyDoctorId;
            }
        } 
        
        if (!resolvedDoctorEmail && doctorName) {
            const doctorProfile = await Doctor.findOne({ name: { $regex: `^${doctorName}$`, $options: 'i' } });
            if (doctorProfile) {
                resolvedDoctorId = doctorProfile.user;
                const doctorUser = await User.findById(doctorProfile.user).select('email');
                resolvedDoctorEmail = doctorUser?.email || '';
            }
        }

        if (resolvedDoctorId) {
            // Check for double booking
            const existingAppointment = await Appointment.findOne({
                doctorId: resolvedDoctorId,
                date,
                time,
                status: { $in: ['upcoming', 'confirmed'] }
            });

            if (existingAppointment) {
                res.status(400).json({ message: 'Doctor is already booked for this time slot.' });
                return;
            }
        }

        const appointment = new Appointment({
            user: req.user?._id,
            doctorId: resolvedDoctorId,
            doctorEmail: resolvedDoctorEmail,
            doctorName,
            patientName,
            specialization,
            date,
            time,
            status: status || 'upcoming',
            type,
            avatar,
            notes,
        });

        const createdAppointment = await appointment.save();

        // Notify the patient
        Notification.create({
            user: req.user?._id,
            title: 'Appointment Booked',
            body: `Your appointment with ${doctorName} is confirmed for ${date} at ${time}.`,
            type: 'appointment'
        }).catch(err => console.error('Patient notification failed:', err));

        // Notify the doctor if we resolved their account
        if (resolvedDoctorId) {
            Notification.create({
                user: resolvedDoctorId,
                title: 'New Appointment',
                body: `${patientName} has booked an appointment with you on ${date} at ${time}.`,
                type: 'appointment'
            }).catch(err => console.error('Doctor notification failed:', err));

            // Auto-Initialize Chat Conversation between Patient and Doctor
            try {
                let conversation = await Conversation.findOne({
                    participants: { $all: [req.user?._id, resolvedDoctorId] }
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [req.user?._id, resolvedDoctorId],
                        participantNames: [patientName, doctorName],
                        lastMessage: `Appointment scheduled for ${date} at ${time}`,
                        lastMessageTime: new Date(),
                        unreadCount: 1
                    });
                    
                    // Add an introductory greeting message from the doctor
                    await Message.create({
                        conversationId: conversation._id.toString(),
                        sender: resolvedDoctorId,
                        senderName: doctorName,
                        content: `Hello ${patientName}, your appointment has been confirmed for ${date} at ${time}. Please let me know if you have any preliminary questions or symptoms you'd like to share before our consultation.`,
                        type: 'text'
                    });
                }
            } catch (chatError) {
                console.error('Failed to auto-initialize chat:', chatError);
            }
        }

        // Send confirmation email to patient
        const emailTo = patientEmail || req.user?.email;
        if (emailTo) {
            sendAppointmentConfirmationEmail(emailTo, {
                patientName,
                doctorName,
                specialization,
                date,
                time,
                type
            }).catch(err => console.error('Appointment email failed:', err));
        }

        res.status(201).json(createdAppointment);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            const isPatientOwner = appointment.user.toString() === req.user?._id.toString();
            const isDoctorOwner  = appointment.doctorId?.toString() === req.user?._id.toString();
            const isAdmin        = req.user?.role === 'admin';

            if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
                res.status(401).json({ message: 'Not authorized to update this appointment' });
                return;
            }

            if (req.body.status === 'cancelled') {
                const cancelledBy = req.user?.role === 'patient' ? 'Patient' : 'Doctor';
                appointment.cancelledBy = cancelledBy;
            }
            appointment.status = req.body.status || appointment.status;
            const updatedAppointment = await appointment.save();

            res.json(updatedAppointment);

        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const rescheduleAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        const isPatientOwner = appointment.user.toString() === req.user?._id.toString();
        const isDoctorOwner  = appointment.doctorId?.toString() === req.user?._id.toString();
        const isAdmin        = req.user?.role === 'admin';

        if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
            res.status(401).json({ message: 'Not authorized to reschedule this appointment' });
            return;
        }

        const { date, time } = req.body;
        
        // Double booking check for reschedule
        if (appointment.doctorId) {
            const existingAppointment = await Appointment.findOne({
                doctorId: appointment.doctorId,
                date,
                time,
                status: { $in: ['upcoming', 'confirmed', 'rescheduled'] },
                _id: { $ne: appointment._id } // exclude self
            });

            if (existingAppointment) {
                res.status(400).json({ message: 'Doctor is already booked for this new time slot.' });
                return;
            }
        }

        appointment.rescheduledFrom = { date: appointment.date, time: appointment.time };
        appointment.date = date;
        appointment.time = time;
        appointment.status = 'rescheduled'; // per requirements
        const rescheduledAppointment = await appointment.save();

        res.json(rescheduledAppointment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }

        const isPatientOwner = appointment.user.toString() === req.user?._id.toString();
        const isDoctorOwner  = appointment.doctorId?.toString() === req.user?._id.toString();
        const isAdmin        = req.user?.role === 'admin';

        if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
            res.status(401).json({ message: 'Not authorized to cancel this appointment' });
            return;
        }

        const cancelledBy = req.user?.role === 'patient' ? 'Patient' : 'Doctor';

        appointment.status = 'cancelled';
        appointment.cancelledBy = cancelledBy;
        const cancelledAppointment = await appointment.save();
        
        // Send notification to the other party
        const notifyTargetUser = req.user?._id.toString() === appointment.user.toString() 
            ? appointment.doctorId // Patient cancelled, notify doctor
            : appointment.user;    // Doctor cancelled, notify patient

        if (notifyTargetUser) {
            Notification.create({
                user: notifyTargetUser,
                title: 'Appointment Cancelled',
                body: `The appointment for ${appointment.date} at ${appointment.time} has been cancelled.`,
                type: 'appointment'
            }).catch(err => console.error('Cancellation notification failed:', err));
        }

        // Send cancellation email to the patient
        const patientUser = await User.findById(appointment.user).select('email');
        if (patientUser?.email) {
            sendCancellationEmail(patientUser.email, {
                patientName: appointment.patientName,
                doctorName: appointment.doctorName,
                date: appointment.date,
                time: appointment.time,
                cancelledBy
            }).catch(err => console.error('Cancellation email failed:', err));
        }

        res.json({ message: 'Appointment cancelled successfully', appointment: cancelledAppointment });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};