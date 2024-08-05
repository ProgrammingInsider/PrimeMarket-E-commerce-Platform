import { body } from 'express-validator';

// Validation rules
export const cartValidation = [
  body('productid')
    .exists()
    .withMessage('Product ID is required')
    .notEmpty()
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ID'),

  body('quantity')
    .exists()
    .withMessage('Quantity is required')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than or equal to 1'),

  body('status')
    .exists()
    .withMessage('Status is required')
    .optional()
    .isIn(['active', 'inactive', 'checkout'])
    .withMessage(
      'Status must be one of the following: active, inactive, checkout'
    ),
];
