import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        dateOfBirth: { type: String, default: '' },
        gender: { type: String, default: '' },
        bloodGroup: { type: String, default: '' },
        height: { type: String, default: '' },
        weight: { type: String, default: '' },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        emergencyContactName: { type: String, default: '' },
        emergencyContactPhone: { type: String, default: '' },
        allergies: { type: String, default: '' },
        chronicConditions: { type: String, default: '' },
        currentMedications: { type: String, default: '' },
        pastSurgeries: { type: String, default: '' },
        insuranceProvider: { type: String, default: '' },
        insurancePolicyNumber: { type: String, default: '' },
        vitals: {
            heartRate: { type: String, default: '72 bpm' },
            bloodPressure: { type: String, default: '120/80' },
            bloodSugar: { type: String, default: '95 mg/dL' },
            weight: { type: String, default: '70 kg' },
        },
    },
    { timestamps: true }
);

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;
