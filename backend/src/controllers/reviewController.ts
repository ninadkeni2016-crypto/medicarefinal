import { Request, Response } from 'express';
import Review from '../models/Review';
import Doctor from '../models/Doctor';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Patient only)
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { doctorId, rating, comment } = req.body;

        if (req.user?.role !== 'patient') {
            res.status(403).json({ message: 'Only patients can leave reviews' });
            return;
        }

        // Check if doctor exists
        const doctorProfile = await Doctor.findOne({ user: doctorId });
        if (!doctorProfile) {
            res.status(404).json({ message: 'Doctor not found' });
            return;
        }

        // Create the review
        const review = await Review.create({
            user: req.user?._id,
            doctorId,
            rating,
            comment
        });

        // Update the doctor's average rating
        const allReviews = await Review.find({ doctorId });
        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
            doctorProfile.rating = Number(avgRating.toFixed(1));
            doctorProfile.reviewsCount = allReviews.length;
            await doctorProfile.save();
        }

        res.status(201).json(review);
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'You have already reviewed this doctor' });
            return;
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a specific doctor
// @route   GET /api/reviews/:doctorId
// @access  Public
export const getDoctorReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { doctorId } = req.params;
        const reviews = await Review.find({ doctorId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        
        res.json(reviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
