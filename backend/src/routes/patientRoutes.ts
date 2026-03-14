import express from 'express';
import { getPatientProfile, updatePatientProfile, getAllPatients } from '../controllers/patientController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router.get('/', protect, authorize('doctor', 'admin'), getAllPatients);
router.get('/profile', protect, getPatientProfile);
router.put('/profile', protect, updatePatientProfile);

export default router;
