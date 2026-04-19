import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        specialization: { type: String, required: true },
        experience: { type: String, default: '1 year' },
        consultationFee: { type: Number, default: 300 },
        rating: { type: Number, default: 4.5 },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
        education: { type: [String], default: [] },
        awards: { type: [String], default: [] },
        languages: { type: [String], default: ['English', 'Hindi'] },
        address: { type: String, default: 'MediCare Clinic, New Delhi' },
        availableSlots: { type: [String], default: ['9:00 AM', '11:00 AM', '2:00 PM'] },
        patientsCount: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ isAvailable: 1 });
doctorSchema.index({ rating: -1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
