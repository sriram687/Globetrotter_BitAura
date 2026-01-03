/**
 * AI Routes
 * Gemini AI-powered trip suggestions and assistance
 */

import { Router, Request, Response } from 'express';
import * as aiService from '../services/ai.service';
import { authenticate } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/ai/trip-suggestions
 * Get AI-powered trip suggestions
 */
router.post('/trip-suggestions', authenticate, async (req: Request, res: Response) => {
  try {
    const { destination, duration, budget, interests, travelStyle } = req.body;
    
    if (!destination || !duration) {
      return sendError(res, 'Destination and duration are required');
    }

    const suggestions = await aiService.getTripSuggestions({
      destination,
      duration: parseInt(duration),
      budget: budget ? parseFloat(budget) : undefined,
      interests,
      travelStyle
    });
    
    return sendSuccess(res, suggestions, 'Trip suggestions generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate suggestions';
    return sendError(res, message, 500);
  }
});

/**
 * POST /api/ai/optimize-itinerary
 * Get itinerary optimization suggestions
 */
router.post('/optimize-itinerary', authenticate, async (req: Request, res: Response) => {
  try {
    const { cities, totalDays, interests, budget } = req.body;
    
    if (!cities || !Array.isArray(cities) || cities.length === 0 || !totalDays) {
      return sendError(res, 'Cities array and total days are required');
    }

    const optimization = await aiService.optimizeItinerary({
      cities,
      totalDays: parseInt(totalDays),
      interests,
      budget: budget ? parseFloat(budget) : undefined
    });
    
    return sendSuccess(res, optimization, 'Itinerary optimization generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to optimize itinerary';
    return sendError(res, message, 500);
  }
});

/**
 * POST /api/ai/activity-suggestions
 * Get activity suggestions for a city
 */
router.post('/activity-suggestions', authenticate, async (req: Request, res: Response) => {
  try {
    const { city, country, category, budget } = req.body;
    
    if (!city || !country) {
      return sendError(res, 'City and country are required');
    }

    const suggestions = await aiService.getActivitySuggestions(
      city,
      country,
      category,
      budget ? parseFloat(budget) : undefined
    );
    
    return sendSuccess(res, suggestions, 'Activity suggestions generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get suggestions';
    return sendError(res, message, 500);
  }
});

/**
 * POST /api/ai/budget-recommendations
 * Get budget recommendations for a destination
 */
router.post('/budget-recommendations', authenticate, async (req: Request, res: Response) => {
  try {
    const { destination, duration, travelStyle } = req.body;
    
    if (!destination || !duration) {
      return sendError(res, 'Destination and duration are required');
    }

    const recommendations = await aiService.getBudgetRecommendations(
      destination,
      parseInt(duration),
      travelStyle || 'moderate'
    );
    
    return sendSuccess(res, recommendations, 'Budget recommendations generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get recommendations';
    return sendError(res, message, 500);
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI travel assistant
 */
router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return sendError(res, 'Message is required');
    }

    const response = await aiService.chatWithAssistant(message, context);
    return sendSuccess(res, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get response';
    return sendError(res, message, 500);
  }
});

export default router;
