import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import connectDB from './src/config/db';
import authRoutes from './src/routes/authRoutes';
import appointmentRoutes from './src/routes/appointmentRoutes';
import prescriptionRoutes from './src/routes/prescriptionRoutes';
import reportRoutes from './src/routes/reportRoutes';
import billRoutes from './src/routes/billRoutes';
import doctorRoutes from './src/routes/doctorRoutes';
import patientRoutes from './src/routes/patientRoutes';
import chatRoutes from './src/routes/chatRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import paymentRoutes from './src/routes/paymentRoutes';
import reviewRoutes from './src/routes/reviewRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import waitlistRoutes from './src/routes/waitlistRoutes';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware';
import { isDemoMode } from './src/config/demoMode';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Tell Express to trust the proxy (Render) so rate limiting works correctly
app.set('trust proxy', 1);

// Global middleware
// Improved CORS configuration for production
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins in development mode
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        const allowedOrigins = [
            'http://localhost:3000', 
            'http://localhost:19006', 
            'http://localhost:8081'
        ];
        
        const isVercel = origin.endsWith('.vercel.app');
        
        if (allowedOrigins.indexOf(origin) !== -1 || isVercel) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(morgan('dev')); // Standard logging
app.use(express.json());

// Rate limiting for auth-related routes to mitigate brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many auth requests from this IP, please try again later.',
    },
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Care Connect Pro API is running smoothly', demoMode: isDemoMode() });
});

// Fallback 404 and global error handler
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB();
        app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV} mode)`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

start();
