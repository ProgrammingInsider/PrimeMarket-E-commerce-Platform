import { body } from 'express-validator';
import { validateURL } from '../utils/validateURL.js';

export const categoryValidation = [
  body('category_name').notEmpty().withMessage('Category Name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('parent_category').optional(),
  body('image_url')
    .optional()
    .isURL()
    .custom((url) => validateURL(url))
    .withMessage('Image URL must be valid'), // Assuming image_url should be a valid URL
  body('depth_level').notEmpty().withMessage('Depth Level is required'),
  body('path').notEmpty().withMessage('Path is required'),
  body('metadata').optional(),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
];
