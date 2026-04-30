import { body } from 'express-validator';

export const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 20 })
    .withMessage('Max 20 characters allowed')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Only alphabets allowed'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Minimum 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Must contain at least 1 letter and 1 number'),
];

export const loginValidators = [
  body('email').isEmail().withMessage('Invalid email'),

  body('password').notEmpty().withMessage('Password required'),
];
