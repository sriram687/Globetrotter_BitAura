/**
 * User Routes
 * Profile management and user operations
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/user.service';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { updateProfileValidation, idParamValidation } from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    return sendSuccess(res, user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    return sendNotFound(res, 'User');
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', authenticate, updateProfileValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const { firstName, lastName, avatar, bio, phone, country, preferences } = req.body;
    const user = await userService.updateProfile(req.user!.id, {
      firstName,
      lastName,
      avatar,
      bio,
      phone,
      country,
      preferences
    });
    
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return sendError(res, message);
  }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await userService.deleteAccount(req.user!.id);
    return sendSuccess(res, result, 'Account deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    return sendError(res, message);
  }
});

/**
 * GET /api/users/stats
 * Get user's travel statistics
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats(req.user!.id);
    return sendSuccess(res, stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get stats';
    return sendError(res, message);
  }
});

/**
 * GET /api/users (Admin only)
 * Get all users
 */
router.get('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await userService.getAllUsers(page, limit);
    return sendSuccess(res, result.users, undefined, 200, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get users';
    return sendError(res, message);
  }
});

/**
 * GET /api/users/:id (Admin only)
 * Get user by ID
 */
router.get('/:id', authenticate, isAdmin, idParamValidation, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user);
  } catch (error) {
    return sendNotFound(res, 'User');
  }
});

export default router;
