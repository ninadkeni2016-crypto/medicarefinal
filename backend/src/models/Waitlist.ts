import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // "Apr 8" format
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'notified', 'expired'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
