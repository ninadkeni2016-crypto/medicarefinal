import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import Doctor from '../models/Doctor';
import AuditLog from '../models/AuditLog';
import generateToken from '../utils/generateToken';
import { sendVerificationEmail } from '../utils/sendEmail';

// @desc    Forgot password — send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) { res.status(404).json({ message: 'No account with that email exists.' }); return; }

        const otp = generateOTP();
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        user.verificationOTP = hashedOTP;
        user.verificationOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        await sendVerificationEmail(email, otp, user.name);

        // Audit log (non-blocking)
        AuditLog.create({
            user: user._id,
            action: 'auth.forgotPassword.requested',
            metadata: { email },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        }).catch(() => {});

        res.json({ message: `Password reset OTP sent to ${email}.` });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, newPassword } = req.body;
    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({ email, verificationOTP: hashedOTP, verificationOTPExpire: { $gt: new Date() } });
        if (!user) { res.status(400).json({ message: 'Invalid or expired OTP.' }); return; }

        user.password = newPassword;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save();

        // Audit log (non-blocking)
        AuditLog.create({
            user: user._id,
            action: 'auth.password.reset',
            metadata: { email },
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        }).catch(() => {});

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: generate 6-digit OTP
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// @desc    Register a new user (unverified) + send OTP email
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    try {
        // If user exists and is already verified, reject
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            res.status(400).json({ message: 'An account with this email already exists.' });
            return;
        }

        const otp = generateOTP();
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (existingUser && !existingUser.isVerified) {
            // Re-send OTP for unverified user
            existingUser.verificationOTP = hashedOTP;
            existingUser.verificationOTPExpire = otpExpire;
            await existingUser.save({ validateBeforeSave: false });
            await sendVerificationEmail(email, otp, existingUser.name);
            res.status(200).json({ message: `Verification OTP resent to ${email}. Please check your inbox.` });
            return;
        }

        // Create new unverified user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
            isVerified: false,
            verificationOTP: hashedOTP,
            verificationOTPExpire: otpExpire,
        });

        // Try to send verification email, but don't fail registration if email sending breaks
        try {
            await sendVerificationEmail(email, otp, name);
        } catch (emailError) {
            console.error('Verification email failed:', emailError);
        }

        res.status(201).json({
            message: `Account created! A 6-digit verification code has been (or will be) sent to ${email}. Please check your inbox.`,
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            verificationOTP: hashedOTP,
            verificationOTPExpire: { $gt: new Date() },
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
            return;
        }

        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // If user is a doctor, ensure a profile exists so they are immediately visible to patients
        if (user.role === 'doctor') {
            const existingProfile = await Doctor.findOne({ user: user._id });
            if (!existingProfile) {
                await Doctor.create({
                    user: user._id,
                    name: user.name,
                    email: user.email,
                    specialization: 'General Medicine', // Default specialization
                    isAvailable: true,
                    availableSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
                });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString()),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found. Please create an account first.', code: 'USER_NOT_FOUND' });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({ message: 'EMAIL_NOT_VERIFIED', email: user.email });
            return;
        }

        if (await (user as any).matchPassword(password)) {
            const token = generateToken(user._id.toString());

            // Audit log (non-blocking)
            AuditLog.create({
                user: user._id,
                action: 'auth.login.success',
                metadata: { email },
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => {});

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            // Audit log (non-blocking)
            AuditLog.create({
                user: user._id,
                action: 'auth.login.failed',
                metadata: { email },
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => {});

            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
