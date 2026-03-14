import express from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus, rescheduleAppointment, cancelAppointment } from '../controllers/appointmentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.route('/:id').put(protect, updateAppointmentStatus).delete(protect, cancelAppointment);
router.route('/:id/reschedule').patch(protect, rescheduleAppointment);

export default router;
