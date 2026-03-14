import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your_super_secret_jwt_key'
            ) as DecodedToken;

            req.user = await User.findById(decoded.id).select('-password');

            return next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
