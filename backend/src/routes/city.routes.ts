/**
 * City Routes
 * City operations within trips
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as cityService from '../services/city.service';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { createCityValidation, idParamValidation } from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/cities
 * Add a city to a trip
 */
router.post('/', authenticate, createCityValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const city = await cityService.addCity(req.user!.id, {
      tripId: req.body.tripId,
      name: req.body.name,
      country: req.body.country,
      countryCode: req.body.countryCode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      image: req.body.image,
      arrivalDate: new Date(req.body.arrivalDate),
      departureDate: new Date(req.body.departureDate),
      notes: req.body.notes,
      accommodation: req.body.accommodation,
      transportMode: req.body.transportMode,
      transportCost: req.body.transportCost
    });
    
    return sendSuccess(res, city, 'City added successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add city';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * GET /api/cities/trip/:tripId
 * Get all cities for a trip
 */
router.get('/trip/:tripId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const cities = await cityService.getTripCities(req.params.tripId, req.user?.id);
    return sendSuccess(res, cities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get cities';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Trip');
  }
});

/**
 * GET /api/cities/search
 * Search popular destinations
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!query || query.length < 2) {
      return sendError(res, 'Search query must be at least 2 characters');
    }
    
    const destinations = await cityService.searchDestinations(query, limit);
    return sendSuccess(res, destinations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed';
    return sendError(res, message);
  }
});

/**
 * GET /api/cities/popular
 * Get popular destinations
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const destinations = await cityService.getPopularDestinations(limit);
    return sendSuccess(res, destinations);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get destinations';
    return sendError(res, message);
  }
});

/**
 * GET /api/cities/:id
 * Get a single city
 */
router.get('/:id', optionalAuth, idParamValidation, async (req: Request, res: Response) => {
  try {
    const city = await cityService.getCityById(req.params.id, req.user?.id);
    return sendSuccess(res, city);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'City not found';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'City');
  }
});

/**
 * PUT /api/cities/:id
 * Update a city
 */
router.put('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['name', 'country', 'countryCode', 'latitude', 'longitude', 'image', 'arrivalDate', 'departureDate', 'notes', 'accommodation', 'transportMode', 'transportCost', 'order'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'arrivalDate' || field === 'departureDate') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const city = await cityService.updateCity(req.params.id, req.user!.id, updateData);
    return sendSuccess(res, city, 'City updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update city';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * DELETE /api/cities/:id
 * Delete a city
 */
router.delete('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await cityService.deleteCity(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'City deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete city';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'City');
  }
});

/**
 * POST /api/cities/reorder
 * Reorder cities in a trip
 */
router.post('/reorder', authenticate, async (req: Request, res: Response) => {
  try {
    const { tripId, cityOrders } = req.body;
    
    if (!tripId || !Array.isArray(cityOrders)) {
      return sendError(res, 'Trip ID and city orders are required');
    }

    const cities = await cityService.reorderCities(tripId, req.user!.id, cityOrders);
    return sendSuccess(res, cities, 'Cities reordered successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reorder cities';
    return sendError(res, message);
  }
});

export default router;
