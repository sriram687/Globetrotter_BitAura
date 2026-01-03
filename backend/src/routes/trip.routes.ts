/**
 * Trip Routes
 * Trip CRUD and sharing operations
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as tripService from '../services/trip.service';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { createTripValidation, updateTripValidation, idParamValidation } from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/trips
 * Create a new trip
 */
router.post('/', authenticate, createTripValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const trip = await tripService.createTrip(req.user!.id, {
      name: req.body.name,
      description: req.body.description,
      coverImage: req.body.coverImage,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      totalBudget: req.body.totalBudget,
      currency: req.body.currency,
      tags: req.body.tags
    });
    
    return sendSuccess(res, trip, 'Trip created successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create trip';
    return sendError(res, message);
  }
});

/**
 * GET /api/trips
 * Get all trips for current user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const result = await tripService.getUserTrips(req.user!.id, page, limit, status);
    return sendSuccess(res, result.trips, undefined, 200, result.pagination);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get trips';
    return sendError(res, message);
  }
});

/**
 * GET /api/trips/upcoming
 * Get upcoming trips
 */
router.get('/upcoming', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const trips = await tripService.getUpcomingTrips(req.user!.id, limit);
    return sendSuccess(res, trips);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get upcoming trips';
    return sendError(res, message);
  }
});

/**
 * GET /api/trips/shared/:token
 * Get trip by share token (public)
 */
router.get('/shared/:token', async (req: Request, res: Response) => {
  try {
    const trip = await tripService.getTripByShareToken(req.params.token);
    return sendSuccess(res, trip);
  } catch (error) {
    return sendNotFound(res, 'Trip');
  }
});

/**
 * POST /api/trips/copy/:token
 * Copy a shared trip to user's account
 */
router.post('/copy/:token', authenticate, async (req: Request, res: Response) => {
  try {
    const trip = await tripService.copyTrip(req.params.token, req.user!.id);
    return sendSuccess(res, trip, 'Trip copied successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to copy trip';
    return sendError(res, message);
  }
});

/**
 * GET /api/trips/:id
 * Get a single trip
 */
router.get('/:id', optionalAuth, idParamValidation, async (req: Request, res: Response) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user?.id);
    return sendSuccess(res, trip);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Trip not found';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Trip');
  }
});

/**
 * PUT /api/trips/:id
 * Update a trip
 */
router.put('/:id', authenticate, updateTripValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'coverImage', 'startDate', 'endDate', 'status', 'isPublic', 'totalBudget', 'currency', 'tags'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const trip = await tripService.updateTrip(req.params.id, req.user!.id, updateData);
    return sendSuccess(res, trip, 'Trip updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update trip';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * DELETE /api/trips/:id
 * Delete a trip
 */
router.delete('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await tripService.deleteTrip(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'Trip deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete trip';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Trip');
  }
});

/**
 * POST /api/trips/:id/share
 * Generate share link for a trip
 */
router.post('/:id/share', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await tripService.generateShareLink(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'Share link generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate share link';
    return sendError(res, message);
  }
});

export default router;
