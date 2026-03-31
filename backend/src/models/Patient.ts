import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
    name: string;
    phone: string;
    gender: string;
    age: number;
    status: 'stable' | 'critical';
    lastVisit: Date;
    doctorId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const patientSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            default: 'Not specified',
        },
        age: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['stable', 'critical'],
            default: 'stable',
        },
        lastVisit: {
            type: Date,
            default: Date.now,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);
export default Patient;
