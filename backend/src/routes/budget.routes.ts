/**
 * Budget Routes
 * Budget and expense management
 */

import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as budgetService from '../services/budget.service';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { createBudgetValidation, createExpenseValidation, idParamValidation } from '../middleware/validation.middleware';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response.utils';

const router = Router();

/**
 * POST /api/budgets
 * Create a budget for a trip
 */
router.post('/', authenticate, createBudgetValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const budget = await budgetService.createBudget(req.user!.id, {
      tripId: req.body.tripId,
      totalBudget: req.body.totalBudget,
      currency: req.body.currency,
      accommodation: req.body.accommodation,
      transportation: req.body.transportation,
      food: req.body.food,
      activities: req.body.activities,
      shopping: req.body.shopping,
      emergency: req.body.emergency,
      other: req.body.other,
      notes: req.body.notes
    });
    
    return sendSuccess(res, budget, 'Budget created successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create budget';
    if (message.includes('already exists')) {
      return sendError(res, message, 409);
    }
    return sendError(res, message);
  }
});

/**
 * GET /api/budgets/trip/:tripId
 * Get budget for a trip
 */
router.get('/trip/:tripId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const budget = await budgetService.getTripBudget(req.params.tripId, req.user?.id);
    
    if (!budget) {
      return sendSuccess(res, null, 'No budget set for this trip');
    }
    
    return sendSuccess(res, budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get budget';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendNotFound(res, 'Trip');
  }
});

/**
 * GET /api/budgets/trip/:tripId/breakdown
 * Get budget breakdown by category
 */
router.get('/trip/:tripId/breakdown', optionalAuth, async (req: Request, res: Response) => {
  try {
    const breakdown = await budgetService.getBudgetBreakdown(req.params.tripId, req.user?.id);
    
    if (!breakdown) {
      return sendSuccess(res, null, 'No budget set for this trip');
    }
    
    return sendSuccess(res, breakdown);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get breakdown';
    return sendError(res, message);
  }
});

/**
 * GET /api/budgets/trip/:tripId/daily
 * Get daily spending breakdown
 */
router.get('/trip/:tripId/daily', optionalAuth, async (req: Request, res: Response) => {
  try {
    const daily = await budgetService.getDailySpending(req.params.tripId, req.user?.id);
    
    if (!daily) {
      return sendSuccess(res, null, 'No budget set for this trip');
    }
    
    return sendSuccess(res, daily);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get daily spending';
    return sendError(res, message);
  }
});

/**
 * GET /api/budgets/categories
 * Get expense categories
 */
router.get('/categories', (req: Request, res: Response) => {
  const categories = budgetService.getExpenseCategories();
  return sendSuccess(res, categories);
});

/**
 * PUT /api/budgets/:id
 * Update a budget
 */
router.put('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'totalBudget', 'currency', 'accommodation', 'transportation',
      'food', 'activities', 'shopping', 'emergency', 'other', 'notes'
    ];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const budget = await budgetService.updateBudget(req.params.id, req.user!.id, updateData);
    return sendSuccess(res, budget, 'Budget updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update budget';
    if (message.includes('Access denied')) {
      return sendError(res, message, 403);
    }
    return sendError(res, message);
  }
});

/**
 * DELETE /api/budgets/:id
 * Delete a budget
 */
router.delete('/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await budgetService.deleteBudget(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'Budget deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete budget';
    return sendNotFound(res, 'Budget');
  }
});

// ===== EXPENSE ROUTES =====

/**
 * POST /api/budgets/expenses
 * Add an expense
 */
router.post('/expenses', authenticate, createExpenseValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array().map(e => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg
      })));
    }

    const expense = await budgetService.addExpense(req.user!.id, {
      budgetId: req.body.budgetId,
      amount: req.body.amount,
      currency: req.body.currency,
      category: req.body.category,
      description: req.body.description,
      date: new Date(req.body.date),
      receipt: req.body.receipt
    });
    
    return sendSuccess(res, expense, 'Expense added successfully', 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add expense';
    return sendError(res, message);
  }
});

/**
 * PUT /api/budgets/expenses/:id
 * Update an expense
 */
router.put('/expenses/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['amount', 'currency', 'category', 'description', 'date', 'receipt'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const expense = await budgetService.updateExpense(req.params.id, req.user!.id, updateData);
    return sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    return sendError(res, message);
  }
});

/**
 * DELETE /api/budgets/expenses/:id
 * Delete an expense
 */
router.delete('/expenses/:id', authenticate, idParamValidation, async (req: Request, res: Response) => {
  try {
    const result = await budgetService.deleteExpense(req.params.id, req.user!.id);
    return sendSuccess(res, result, 'Expense deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete expense';
    return sendNotFound(res, 'Expense');
  }
});

export default router;
