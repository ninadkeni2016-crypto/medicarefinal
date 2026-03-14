import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['Blood Test', 'X-Ray', 'MRI', 'Lab Report'],
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        doctorName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Ready', 'Pending'],
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

const Report = mongoose.model('Report', reportSchema);

export default Report;
