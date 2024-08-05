import { body } from 'express-validator';

export const signupUpdateValidation = [
  body('_id')
    .exists()
    .withMessage('User ID is required')
    .notEmpty()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ID'),

  body('firstname')
    .notEmpty()
    .withMessage('First Name is required')
    .isLength({ max: 50 })
    .withMessage('First Name cannot exceed 50 characters'),

  body('lastname')
    .notEmpty()
    .withMessage('Last Name is required')
    .isLength({ max: 50 })
    .withMessage('Last Name cannot exceed 50 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 320 })
    .withMessage('Email cannot exceed 320 characters')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
    .withMessage('Email has been normalized'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters')
    .matches(/^\+?[0-9\s\-()]*$/)
    .withMessage('Phone number must be valid'),

  body('street')
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ max: 150 })
    .withMessage('Street cannot exceed 150 characters'),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('postalCode')
    .optional({ checkFalsy: true })
    .isLength({ max: 20 })
    .withMessage('Postal Code cannot exceed 20 characters')
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/)
    .withMessage('Postal Code must be valid'),

  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters'),
];
