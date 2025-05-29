import { ValidationChain, param } from 'express-validator';


export const getRepoValidator: ValidationChain[] = [
    param('id')
        .exists().withMessage('ID parameter is required')
        .isInt().withMessage('ID must be a number')
        .notEmpty().withMessage('ID cannot be empty')
];