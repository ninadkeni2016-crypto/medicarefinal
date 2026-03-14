import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment';
import Bill from '../models/Bill';
import Notification from '../models/Notification';
import { sendPaymentSuccessEmail } from '../utils/sendEmail';

interface AuthRequest extends Request {
  user?: any;
}

// Ensure keys exist (for safety). In production, these must be set.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create a Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { billId } = req.body;
        
        const bill = await Bill.findById(billId);
        if (!bill) {
            res.status(404).json({ message: 'Bill not found' });
            return;
        }

        const options = {
            amount: bill.total * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${billId}`,
        };

        const order = await razorpay.orders.create(options);
        
        // Return order ID and other details to frontend to initiate checkout
        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify signature and save payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            billId 
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Save successful payment record
            const bill = await Bill.findById(billId);
            const amount = bill ? bill.total : 0;

            await Payment.create({
                user: req.user?._id,
                bill: billId,
                amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'success'
            });

            if (bill) {
                bill.status = 'Paid';
                await bill.save();
            }

            // Notification for success
            Notification.create({
                user: req.user?._id,
                title: 'Payment Successful',
                body: `Payment of ₹${amount} received successfully.`,
                type: 'billing'
            }).catch(console.error);

            // Send Email Receipt
            if (req.user?.email) {
                sendPaymentSuccessEmail(req.user.email, {
                    patientName: req.user.name || 'Patient',
                    amount,
                    transactionId: razorpay_payment_id,
                    date: new Date().toLocaleDateString()
                }).catch(err => console.error('Payment email failed:', err));
            }

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            // Invalid signature
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's past payments
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const payments = await Payment.find({ user: req.user?._id })
            .populate('bill')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
