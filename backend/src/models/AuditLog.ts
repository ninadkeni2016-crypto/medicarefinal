import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        ip: {
            type: String,
        },
        userAgent: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

