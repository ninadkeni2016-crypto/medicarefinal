import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: true,
        },
        doctorName: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        consultationFee: {
            type: Number,
            required: true,
        },
        treatmentCost: {
            type: Number,
            default: 0,
        },
        labCharges: {
            type: Number,
            default: 0,
        },
        medicineCost: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Paid', 'Pending', 'Overdue'],
            default: 'Pending',
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

billSchema.index({ user: 1 });
billSchema.index({ status: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
