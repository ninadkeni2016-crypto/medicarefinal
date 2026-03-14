import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
        specialties: { type: [String], default: [] },
        images: { type: [String], default: [] },
        openingHours: { type: String, default: '9:00 AM - 8:00 PM' },
        rating: { type: Number, default: 4.8 },
    },
    { timestamps: true }
);

const Clinic = mongoose.model('Clinic', clinicSchema);
export default Clinic;
