import express from 'express';
import { 
    getAppointments, 
    createAppointment, 
    updateAppointmentStatus, 
    rescheduleAppointment, 
    cancelAppointment, 
    getAvailableSlots,
    getQueueStatus,
    checkInAppointment,
    startConsultation,
    completeConsultation,
    getAppointmentById,
    updateClinicalData
} from '../controllers/appointmentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.get('/available-slots', protect, getAvailableSlots);
router.get('/queue-status', protect, getQueueStatus);
router.put('/:id/check-in', protect, checkInAppointment);
router.put('/:id/start-consultation', protect, startConsultation);
router.put('/:id/complete-consultation', protect, completeConsultation);

router.route('/:id').get(protect, getAppointmentById).put(protect, updateAppointmentStatus).delete(protect, cancelAppointment);
router.route('/:id/reschedule').patch(protect, rescheduleAppointment);
router.patch('/:id/clinical-data', protect, updateClinicalData);

export default router;
