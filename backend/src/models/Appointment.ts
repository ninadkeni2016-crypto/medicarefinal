import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
    {
        doctorName: {
            type: String,
            required: true,
        },
        patientName: {
            type: String,
            required: true,
        },
        specialization: {
            type: String,
            required: true,
        },
        date: {
            type: String, // Kept as string for simplicity to match frontend formatting, can be changed to Date if needed
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['upcoming', 'confirmed', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        type: {
            type: String,
            enum: ['In-Person', 'Video Call'],
            required: true,
        },
        avatar: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        doctorId: {
            // The User._id of the doctor — set when booking so the doctor can query their appointments
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        doctorEmail: {
            // Fallback lookup: doctor's email for matching when doctorId is not set
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
