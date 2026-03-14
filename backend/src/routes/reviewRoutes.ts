import express from 'express';
import { createReview, getDoctorReviews } from '../controllers/reviewController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:doctorId', getDoctorReviews);

export default router;
