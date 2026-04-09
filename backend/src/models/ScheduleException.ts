import mongoose from 'mongoose';

const scheduleExceptionSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // "Apr 8" format to match standard
            required: true,
        },
        startTime: {
            type: String, // "09:00 AM"
            required: true,
        },
        endTime: {
            type: String, // "05:00 PM"
            required: true,
        },
        type: {
            type: String,
            enum: ['leave', 'break', 'emergency', 'extra-hours'],
            default: 'leave',
        },
        reason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const ScheduleException = mongoose.model('ScheduleException', scheduleExceptionSchema);

export default ScheduleException;
