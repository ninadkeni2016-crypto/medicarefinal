import express from 'express';
import { getPrescriptions, createPrescription } from '../controllers/prescriptionController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router
    .route('/')
    .get(protect, getPrescriptions)
    .post(protect, authorize('doctor', 'admin'), createPrescription);

export default router;
