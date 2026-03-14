import express from 'express';
import { getDashboardStats, getAllUsers, getAllDoctors, getAllAppointments, getAllPayments } from '../controllers/adminController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/users', protect, getAllUsers);
router.get('/doctors', protect, getAllDoctors);
router.get('/appointments', protect, getAllAppointments);
router.get('/payments', protect, getAllPayments);

export default router;
