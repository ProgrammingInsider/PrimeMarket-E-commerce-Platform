import { body } from 'express-validator';

export const productValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name required')
    .isLength({ max: 255 })
    .withMessage('Maximum of 255 characters is allowed for product name'),

  body('description')
    .notEmpty()
    .withMessage('Product Description required')
    .isLength({ max: 1000 })
    .withMessage(
      'Maximum of 1000 characters is allowed for product description'
    ),

  body('price')
    .notEmpty()
    .withMessage('Product Price required')
    .isFloat({ min: 0 })
    .withMessage('Price less than 0 is invalid'),

  body('stock')
    .notEmpty()
    .withMessage('Stock amount required')
    .isInt({ min: 0 })
    .withMessage('Stock less than 0 is invalid'),

  body('category').notEmpty().isMongoId().withMessage('Category Id required'),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Maximum of 100 characters is allowed for brand'),

  body('averageRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating should be between 0 - 5'),

  body('ratingCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rating count less than 0 is invalid'),

  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Maximum of 50 characters is allowed for SKU'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight less than 0 is invalid'),

  body('dimensions')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Maximum of 100 characters is allowed for dimensions')
    .trim(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('The value should be boolean'),
];
