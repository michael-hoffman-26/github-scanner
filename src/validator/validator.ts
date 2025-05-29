import { validationResult } from 'express-validator';
import { Response, Request, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error(errors.array())
        return res.status(400).json(errors.array());
    }
    next();
}