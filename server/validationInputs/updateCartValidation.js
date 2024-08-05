import { body } from 'express-validator';

export const updateCartValidation = [
  body('_id')
    .exists()
    .withMessage('User ID is required')
    .notEmpty()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),

  body('quantity')
    .exists()
    .withMessage('Quantity is required')
    .notEmpty()
    .isInt()
    .withMessage('Quantity must be an integer'),
];
