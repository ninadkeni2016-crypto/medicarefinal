import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        bill: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Bill',
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        razorpayOrderId: {
            type: String,
            required: true,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
