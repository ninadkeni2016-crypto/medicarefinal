import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
    {
        doctorName: {
            type: String,
            required: true,
        },
        patientName: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        medicines: [
            {
                name: { type: String, required: true },
                dosage: { type: String, required: true },
                frequency: { type: String, required: true },
                duration: { type: String, required: true },
            },
        ],
        notes: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
