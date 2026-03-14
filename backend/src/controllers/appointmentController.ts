import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Doctor from '../models/Doctor';
import { sendAppointmentConfirmationEmail, sendCancellationEmail } from '../utils/sendEmail';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get appointments
//          - Patient: sees their own booked appointments
//          - Doctor:  sees appointments booked for them (by doctorId, doctorEmail, or doctorName)
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let appointments;

        if (req.user?.role === 'doctor') {
            // Try to get the doctor's display name from their Doctor profile
            const doctorProfile = await Doctor.findOne({ user: req.user._id });
            const doctorName = doctorProfile?.name || req.user?.name || '';

            // Match by: explicit doctorId link, email link, or name string (backward compat)
            appointments = await Appointment.find({
                $or: [
                    { doctorId: req.user._id },
                    { doctorEmail: req.user.email },
                    ...(doctorName ? [{ doctorName: { $regex: `^${doctorName}$`, $options: 'i' } }] : []),
                ],
            }).sort({ createdAt: -1 });
        } else {
            // Patient — only their own bookings
            appointments = await Appointment.find({ user: req.user?._id }).sort({ createdAt: -1 });
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
        patientEmail,
        doctorId: bodyDoctorId,
    } = req.body;

    try {
        // Resolve the doctor's User account to link the appointment
        // Priority: 1) doctorId sent from client, 2) look up Doctor profile by name
        let resolvedDoctorId = bodyDoctorId || null;
        let resolvedDoctorEmail = '';

        if (resolvedDoctorId) {
            const doctorUser = await User.findById(resolvedDoctorId).select('email');
            resolvedDoctorEmail = doctorUser?.email || '';
        } else if (doctorName) {
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
        const isAdmin = req.user?.role === 'admin';

        if (!isPatientOwner && !isAdmin) {
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

        appointment.date = date;
        appointment.time = time;
        appointment.status = 'upcoming'; // reset status
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

        appointment.status = 'cancelled';
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

        const cancelledBy = req.user?.role === 'patient' ? 'Patient' : 'Doctor';

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