/**
 * Activity Routes
 * Activity operations within cities
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as activityService from '../services/activity.service';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { createActivityValidation, idParamValidation } from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/activities
 * Add an activity to a city
 */
router.post('/', authenticate, createActivityValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const activity = await activityService.addActivity(req.user!.id, {
      cityId: req.body.cityId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      location: req.body.location,
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      image: req.body.image,
      date: new Date(req.body.date),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      duration: req.body.duration,
      cost: req.body.cost,
      currency: req.body.currency,
      notes: req.body.notes
    });
    
    return sendSuccess(res, activity, 'Activity added successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add activity';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * GET /api/activities/city/:cityId
 * Get all activities for a city
 */
router.get('/city/:cityId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const activities = await activityService.getCityActivities(req.params.cityId, req.user?.id);
    return sendSuccess(res, activities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get activities';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'City');
  }
});

/**
 * GET /api/activities/trip/:tripId/by-day
 * Get activities grouped by day
 */
router.get('/trip/:tripId/by-day', optionalAuth, async (req: Request, res: Response) => {
  try {
    const activitiesByDay = await activityService.getActivitiesByDay(req.params.tripId, req.user?.id);
    return sendSuccess(res, activitiesByDay);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get activities';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * GET /api/activities/categories
 * Get all activity categories
 */
router.get('/categories', (req: Request, res: Response) => {
  const categories = activityService.getActivityCategories();
  return sendSuccess(res, categories);
});

/**
 * GET /api/activities/templates
 * Search activity templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const destination = req.query.destination as string;
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!destination) {
      return sendError(res, 'Destination is required');
    }

    const templates = await activityService.searchActivityTemplates(
      destination,
      category as never,
      limit
    );
    return sendSuccess(res, templates);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search templates';
    return sendError(res, message);
  }
});

/**
 * GET /api/activities/:id
 * Get a single activity
 */
router.get('/:id', optionalAuth, idParamValidation, async (req: Request, res: Response) => {
  try {
    const activity = await activityService.getActivityById(req.params.id, req.user?.id);
    return sendSuccess(res, activity);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Activity not found';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Activity');
  }
});

/**
 * PUT /api/activities/:id
 * Update an activity
 */
router.put('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'description', 'category', 'location', 'address',
      'latitude', 'longitude', 'image', 'date', 'startTime', 'endTime',
      'duration', 'cost', 'currency', 'notes', 'order', 'isBooked', 'bookingRef', 'rating'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const activity = await activityService.updateActivity(req.params.id, req.user!.id, updateData);
    return sendSuccess(res, activity, 'Activity updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update activity';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * DELETE /api/activities/:id
 * Delete an activity
 */
router.delete('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await activityService.deleteActivity(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'Activity deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete activity';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Activity');
  }
});

/**
 * POST /api/activities/reorder
 * Reorder activities in a city
 */
router.post('/reorder', authenticate, async (req: Request, res: Response) => {
  try {
    const { cityId, activityOrders } = req.body;
    
    if (!cityId || !Array.isArray(activityOrders)) {
      return sendError(res, 'City ID and activity orders are required');
    }

    const activities = await activityService.reorderActivities(cityId, req.user!.id, activityOrders);
    return sendSuccess(res, activities, 'Activities reordered successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reorder activities';
    return sendError(res, message);
  }
});

export default router;
