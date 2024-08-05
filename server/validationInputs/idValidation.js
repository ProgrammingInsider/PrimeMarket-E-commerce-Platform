import { body } from 'express-validator';

export const idValidation = [
  body('_id')
    .exists()
    .withMessage('ID is required')
    .notEmpty()
    .isMongoId()
    .withMessage('ID must be a valid MongoDB ID'),
];
