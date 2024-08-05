import { body } from 'express-validator';

export const signinValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 320 })
    .withMessage('Email cannot exceed 320 characters')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
    .withMessage('Email has been normalized'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/
    )
    .withMessage(
      'Password must contain one uppercase letter, one lowercase letter, one digit, and one special character'
    ),
];
