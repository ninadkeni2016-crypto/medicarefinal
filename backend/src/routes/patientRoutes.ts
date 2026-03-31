import express from 'express';
import { getPatientProfile, updatePatientProfile, getAllPatients, getDoctorPatients, getDoctorPatientById, createDoctorPatient, updateDoctorPatient } from '../controllers/patientController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router.get('/', protect, authorize('doctor', 'admin'), getAllPatients);
router.get('/profile', protect, getPatientProfile);
router.put('/profile', protect, updatePatientProfile);

// Custom Patient Records for Doctors
router.get('/doctor', protect, authorize('doctor'), getDoctorPatients);
router.get('/doctor/:id', protect, authorize('doctor'), getDoctorPatientById);
router.post('/doctor', protect, authorize('doctor'), createDoctorPatient);
router.patch('/doctor/:id', protect, authorize('doctor'), updateDoctorPatient);

export default router;
