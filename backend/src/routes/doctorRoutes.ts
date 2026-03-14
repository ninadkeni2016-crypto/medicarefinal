import express from 'express';
import { getDoctors, getDoctorById, upsertDoctorProfile, getOwnDoctorProfile } from '../controllers/doctorController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// IMPORTANT: /profile must come BEFORE /:id to avoid 'profile' being treated as an id
router.get('/profile', protect, getOwnDoctorProfile);
router.put('/profile', protect, upsertDoctorProfile);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

export default router;
