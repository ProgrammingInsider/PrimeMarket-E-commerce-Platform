import { body } from 'express-validator';

export const oldPublicIdValidation = [
  body('oldPublicId')
    .custom((value) => {
      if (value === null || typeof value === 'string') {
        return true;
      }
      throw new Error('Invalid Public ID');
    })
    .optional(),
];
