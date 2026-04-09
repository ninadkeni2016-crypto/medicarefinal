import express from 'express';
import { addToWaitlist, getMyWaitlists } from '../controllers/waitlistController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
    .post(protect, addToWaitlist)
    .get(protect, getMyWaitlists);

export default router;
