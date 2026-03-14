import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

export default router;
