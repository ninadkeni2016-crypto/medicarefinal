import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import User from '../models/User';
import Doctor from '../models/Doctor';
import { sendAppointmentConfirmationEmail, sendCancellationEmail, sendAppointmentCompletionEmail } from '../utils/sendEmail';
import Notification from '../models/Notification';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { isDemoMode } from '../config/demoMode';
import { demoAppointments } from '../data/demoData';
import ScheduleException from '../models/ScheduleException';
import Waitlist from '../models/Waitlist';

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
        if (isDemoMode() && !req.user) {
            res.setHeader('X-Demo-Data', 'true');
            res.json(demoAppointments);
            return;
        }

        let appointments: any[];

        if (req.user?.role === 'doctor') {
            // Filter by doctorId (User ID)
            appointments = await Appointment.find({
                $or: [
                    { doctorId: req.user._id },
                    { doctorEmail: req.user.email }
                ],
            }).sort({ date: 1, time: 1 });
        } else {
            // Filter by patientId/user
            appointments = await Appointment.find({
                $or: [
                    { user: req.user?._id },
                    { patientId: req.user?._id }
                ]
            }).sort({ date: 1, time: 1 });
        }

        // Only return demo data if NO results AND not in a real user session or explicitly requested
        if (appointments.length === 0 && isDemoMode()) {
            if (req.user?.role === 'doctor') {
                res.setHeader('X-Demo-Data', 'true');
                res.json(demoAppointments);
                return;
            }
            // For patients, return empty array if no real appointments found
            res.json([]);
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
                status: { $in: ['upcoming', 'confirmed', 'rescheduled'] }
            });

            if (existingAppointment) {
                res.status(400).json({ message: 'Doctor is already booked for this time slot.' });
                return;
            }
        }

        const appointment = new Appointment({
            user: req.user?._id,
            patientId: req.user?._id,
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

            const oldStatus = appointment.status;
            const newStatus = req.body.status || appointment.status;
            appointment.status = newStatus;

            const updatedAppointment = await appointment.save();

            // Send notification and message if marked as completed
            if (newStatus === 'completed' && oldStatus !== 'completed') {
                // Determine patient ID correctly
                const patientUserId = appointment.user || appointment.patientId;
                
                if (patientUserId) {
                    Notification.create({
                        user: patientUserId,
                        title: 'Appointment Completed',
                        body: `Your appointment with ${appointment.doctorName} on ${appointment.date} has been completed.`,
                        type: 'appointment'
                    }).catch(err => console.error('Completion notification failed:', err));

                    if (appointment.doctorId) {
                        try {
                            const conversation = await Conversation.findOne({
                                participants: { $all: [patientUserId, appointment.doctorId] }
                            });
                            if (conversation) {
                                await Message.create({
                                    conversationId: conversation._id.toString(),
                                    sender: appointment.doctorId,
                                    senderName: appointment.doctorName,
                                    content: `Your appointment for ${appointment.date} has been successfully completed. Thank you, and take care!`,
                                    type: 'text'
                                });
                                conversation.lastMessage = 'Your appointment has been successfully completed.';
                                conversation.lastMessageTime = new Date();
                                conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                                await conversation.save();
                            }
                        } catch (chatError) {
                            console.error('Completion chat message failed:', chatError);
                        }
                    }

                    // Send email on completion
                    const patientUserObj = await User.findById(patientUserId).select('email');
                    if (patientUserObj?.email) {
                        sendAppointmentCompletionEmail(patientUserObj.email, {
                            patientName: appointment.patientName,
                            doctorName: appointment.doctorName,
                            date: appointment.date,
                            time: appointment.time
                        }).catch(err => console.error('Completion email failed:', err));
                    }
                }
            }

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

        // WAITLIST BROADCAST: Notify patients waiting for this date/doctor
        try {
            const waiters = await Waitlist.find({
                doctorId: appointment.doctorId,
                date: appointment.date,
                status: 'active'
            });

            if (waiters.length > 0) {
                const notifications = waiters.map(waiter => ({
                    user: waiter.patientId,
                    title: 'Slot Available! 📅',
                    body: `A slot just opened up for ${appointment.doctorName} on ${appointment.date}. Book now before it's gone!`,
                    type: 'appointment'
                }));
                await Notification.insertMany(notifications);
                
                // Mark as notified so they don't get duplicate notifications
                await Waitlist.updateMany(
                    { _id: { $in: waiters.map(w => w._id) } },
                    { status: 'notified' }
                );
            }
        } catch (waitError) {
            console.error('Waitlist broadcast failed:', waitError);
        }

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/appointments/available-slots
// @access  Private
export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        res.status(400).json({ message: 'doctorId and date are required' });
        return;
    }

    try {
        // Assume clinic hours 09:00 AM to 05:00 PM with 30 min slots
        const allSlots = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
            '04:00 PM', '04:30 PM'
        ];

        // Resolve doctor ID (User ID) if a Doctor profile ID was passed
        let resolvedDoctorId = doctorId as string;
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(doctorId as string);
        if (isValidObjectId) {
            const doctorProfile = await Doctor.findById(doctorId).catch(() => null);
            if (doctorProfile && doctorProfile.user) {
                resolvedDoctorId = doctorProfile.user.toString();
            }
        }

        const bookedAppointments = await Appointment.find({
            doctorId: resolvedDoctorId,
            date: date as string,
            status: { $in: ['upcoming', 'confirmed', 'rescheduled'] }
        }).select('time');

        const bookedTimes = bookedAppointments.map(a => a.time);

        // Fetch Schedule Exceptions (Leaves, Emergency blocks)
        const exceptions = await ScheduleException.find({
            doctorId: resolvedDoctorId,
            date: date as string
        });

        const availableSlots = allSlots.map(slot => {
            const isBooked = bookedTimes.includes(slot);
            const isException = exceptions.some(ex => {
                // Simple string time comparison - professional version would use Date objects
                return slot >= ex.startTime && slot <= ex.endTime;
            });

            return {
                time: slot,
                available: !isBooked && !isException
            };
        });

        res.json(availableSlots);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check in an appointment
// @route   PUT /api/appointments/:id/check-in
// @access  Private
export const checkInAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        appointment.checkInTime = new Date();
        appointment.visitStatus = 'checked-in';
        const updated = await appointment.save();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start a consultation
// @route   PUT /api/appointments/:id/start-consultation
// @access  Private
export const startConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        appointment.consultationStartTime = new Date();
        appointment.visitStatus = 'in-consultation';
        appointment.status = 'confirmed';
        const updated = await appointment.save();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Complete a consultation
// @route   PUT /api/appointments/:id/complete-consultation
// @access  Private
export const completeConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            res.status(404).json({ message: 'Appointment not found' });
            return;
        }
        appointment.consultationEndTime = new Date();
        appointment.visitStatus = 'completed';
        appointment.status = 'completed';
        const updated = await appointment.save();
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get real-time queue status for a doctor
// @route   GET /api/appointments/queue-status
// @access  Private
export const getQueueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
        res.status(400).json({ message: 'doctorId and date are required' });
        return;
    }

    try {
        const appointments = await Appointment.find({
            doctorId,
            date: date as string,
            status: { $in: ['upcoming', 'confirmed', 'rescheduled'] }
        }).sort({ time: 1 });

        const activeVisit = appointments.find(a => a.visitStatus === 'in-consultation');
        let totalDelayMinutes = 0;

        if (activeVisit && activeVisit.consultationStartTime) {
            const now = new Date();
            const startedAt = new Date(activeVisit.consultationStartTime);
            const elapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60);
            
            // Assume 15 min per visit
            if (elapsed > 15) {
                totalDelayMinutes = Math.floor(elapsed - 15);
            }
        }

        const patientAppointment = appointments.find(a => 
            a.user.toString() === req.user?._id.toString() || 
            a.patientId?.toString() === req.user?._id.toString()
        );

        let queuePosition = -1;
        if (patientAppointment) {
            const upcomingOnes = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
            queuePosition = upcomingOnes.findIndex(a => a._id.toString() === patientAppointment._id.toString()) + 1;
        }

        res.json({
            totalAppointments: appointments.length,
            activeVisit: activeVisit ? {
                patientName: activeVisit.patientName,
                startTime: activeVisit.consultationStartTime
            } : null,
            delayMinutes: totalDelayMinutes,
            queuePosition,
            estimatedWaitTime: queuePosition > 0 ? (queuePosition - 1) * 15 + totalDelayMinutes : 0
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            const isPatientOwner = appointment.user.toString() === req.user?._id.toString();
            const isDoctorOwner  = appointment.doctorId?.toString() === req.user?._id.toString();
            const isAdmin        = req.user?.role === 'admin';

            if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
                res.status(401).json({ message: 'Not authorized to view this appointment' });
                return;
            }

            res.json(appointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment clinical data (workflow state)
// @route   PATCH /api/appointments/:id/clinical-data
// @access  Private
export const updateClinicalData = async (req: AuthRequest, res: Response): Promise<void> => {
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
            res.status(401).json({ message: 'Not authorized to update this clinical data' });
            return;
        }

        // Merge existing clinical data with new updates
        const existingData = appointment.clinicalData || {};
        const newData = req.body;
        
        appointment.clinicalData = { ...existingData, ...newData };
        
        // Mark as modified if it's a nested object (Mongoose quirk)
        appointment.markModified('clinicalData');
        
        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};