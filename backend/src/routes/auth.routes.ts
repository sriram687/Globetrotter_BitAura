/**
 * Authentication Routes
 * Login, Register, Password Management
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation
} from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { email, password, firstName, lastName } = req.body;
    const result = await authService.register({ email, password, firstName, lastName });
    
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return sendError(res, message, message.includes('already') ? 409 : 400);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return sendError(res, message, 401);
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiate password reset
 */
router.post('/forgot-password', forgotPasswordValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    
    return sendSuccess(res, result, 'Password reset initiated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return sendError(res, message);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', resetPasswordValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    
    return sendSuccess(res, result, 'Password reset successful');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    return sendError(res, message);
  }
});

/**
 * POST /api/auth/change-password
 * Change password (authenticated)
 */
router.post('/change-password', authenticate, changePasswordValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
    
    return sendSuccess(res, result, 'Password changed successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return sendError(res, message);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    return sendSuccess(res, user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return sendError(res, message, 404);
  }
});

/**
 * POST /api/auth/verify-token
 * Verify if token is valid
 */
router.post('/verify-token', authenticate, (req: Request, res: Response) => {
  return sendSuccess(res, { valid: true, user: req.user }, 'Token is valid');
});

export default router;
