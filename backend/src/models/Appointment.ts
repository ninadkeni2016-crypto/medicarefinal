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
            enum: ['upcoming', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
            default: 'upcoming',
        },
        type: {
            type: String,
            enum: ['In-Person'],
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
        patientId: {
            // Explicit patientId field to match requirement, points to the same User as 'user'
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorId: {
            // The User._id of the doctor — set when booking so the doctor can query their appointments
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctorEmail: {
            // Fallback lookup: doctor's email for matching when doctorId is not set
            type: String,
            default: '',
        },
        notes: {
            type: String,
            default: '',
        },
        cancelledBy: {
            type: String,
            enum: ['Patient', 'Doctor', null],
            default: null,
        },
        rescheduledFrom: {
            type: Object, // { date, time }
            default: null,
        },
        checkInTime: {
            type: Date,
        },
        consultationStartTime: {
            type: Date,
        },
        consultationEndTime: {
            type: Date,
        },
        visitStatus: {
            type: String,
            enum: ['pending', 'checked-in', 'in-consultation', 'completed'],
            default: 'pending',
        },
        clinicalData: {
            type: Object,
            default: {
                currentStep: 0,
                vitals: { bp: '', hr: '', temp: '', weight: '' },
                symptoms: [],
                consultationNotes: '',
                diagnosis: '',
                medicines: [],
                prescriptionNotes: '',
                reportName: '',
                reportType: '',
                reportDate: '',
                labName: '',
                reportRemarks: '',
                billItems: { 
                    consultationFee: 500, 
                    treatmentCost: 0, 
                    labCharges: 0, 
                    medicineCost: 0, 
                    otherCharges: 0 
                },
                discount: 0,
                gst: 18,
                paymentDone: false,
                paymentMethod: ''
            }
        }
    },
    {
        timestamps: true,
    }
);

appointmentSchema.index({ user: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ doctorEmail: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
