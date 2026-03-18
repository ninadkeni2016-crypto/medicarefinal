import express from 'express';
import { getDashboardStats, getDashboardData } from '../controllers/dashboardController';
import { protect } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/roleMiddleware';

const router = express.Router();

router.get('/stats', protect, authorize('doctor', 'admin'), getDashboardStats);
router.get('/data', protect, authorize('doctor', 'admin'), getDashboardData);

export default router;
