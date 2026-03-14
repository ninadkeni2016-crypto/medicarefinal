import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        body: { type: String, required: true },
        type: {
            type: String,
            enum: ['appointment', 'prescription', 'message', 'billing', 'system'],
            default: 'system',
        },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
