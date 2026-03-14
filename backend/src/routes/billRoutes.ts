import express from 'express';
import { getBills, createBill } from '../controllers/billController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router
    .route('/')
    .get(protect, getBills)
    .post(protect, authorize('doctor', 'admin'), createBill);

export default router;
