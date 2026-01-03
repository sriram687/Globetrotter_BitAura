/**
 * Validation Middleware
 * Request validation using express-validator
 */

import { body, param, query, ValidationChain } from 'express-validator';

// Auth validations
export const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const forgotPasswordValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

export const resetPasswordValidation: ValidationChain[] = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Trip validations
export const createTripValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Trip name is required')
    .isLength({ max: 100 })
    .withMessage('Trip name must be less than 100 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

export const updateTripValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('Trip ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Trip name must be less than 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required')
];

// City validations
export const createCityValidation: ValidationChain[] = [
  body('tripId')
    .notEmpty()
    .withMessage('Trip ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('City name is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('arrivalDate')
    .isISO8601()
    .withMessage('Valid arrival date is required'),
  body('departureDate')
    .isISO8601()
    .withMessage('Valid departure date is required')
];

// Activity validations
export const createActivityValidation: ValidationChain[] = [
  body('cityId')
    .notEmpty()
    .withMessage('City ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Activity name is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
];

// Budget validations
export const createBudgetValidation: ValidationChain[] = [
  body('tripId')
    .notEmpty()
    .withMessage('Trip ID is required'),
  body('totalBudget')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number')
];

// Expense validations
export const createExpenseValidation: ValidationChain[] = [
  body('budgetId')
    .notEmpty()
    .withMessage('Budget ID is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
];

// Profile validations
export const updateProfileValidation: ValidationChain[] = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

export const changePasswordValidation: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

// ID param validation
export const idParamValidation: ValidationChain[] = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
];
