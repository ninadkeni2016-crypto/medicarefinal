import { Request, Response, NextFunction } from 'express';

export const authorize =
    (...allowedRoles: string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const role = req.user?.role;

        if (!role || !allowedRoles.includes(role)) {
            res.status(403).json({ message: 'Forbidden: insufficient permissions' });
            return;
        }

        next();
    };

