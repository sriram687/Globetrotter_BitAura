/**
 * Budget Service
 * Handles budget and expense operations
 */

import { prisma } from '../index';
import { ExpenseCategory } from '@prisma/client';

interface CreateBudgetData {
  tripId: string;
  totalBudget: number;
  currency?: string;
  accommodation?: number;
  transportation?: number;
  food?: number;
  activities?: number;
  shopping?: number;
  emergency?: number;
  other?: number;
  notes?: string;
}

interface UpdateBudgetData extends Partial<Omit<CreateBudgetData, 'tripId'>> {}

interface CreateExpenseData {
  budgetId: string;
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  description?: string;
  date: Date;
  receipt?: string;
}

/**
 * Create budget for a trip
 */
export const createBudget = async (userId: string, data: CreateBudgetData) => {
  // Verify trip ownership
  const trip = await prisma.trip.findUnique({
    where: { id: data.tripId }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  if (trip.userId !== userId) {
    throw new Error('Access denied');
  }

  // Check if budget already exists
  const existingBudget = await prisma.budget.findUnique({
    where: { tripId: data.tripId }
  });

  if (existingBudget) {
    throw new Error('Budget already exists for this trip');
  }

  const budget = await prisma.budget.create({
    data: {
      ...data,
      currency: data.currency || 'USD'
    },
    include: {
      expenses: true
    }
  });

  return budget;
};

/**
 * Get budget for a trip
 */
export const getTripBudget = async (tripId: string, userId?: string) => {
  // Verify access
  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  if (!trip.isPublic && trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const budget = await prisma.budget.findUnique({
    where: { tripId },
    include: {
      expenses: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!budget) {
    return null;
  }

  // Calculate totals
  const actualSpent = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const plannedTotal = 
    budget.accommodation +
    budget.transportation +
    budget.food +
    budget.activities +
    budget.shopping +
    budget.emergency +
    budget.other;

  const remaining = budget.totalBudget - actualSpent;
  const isOverBudget = actualSpent > budget.totalBudget;

  return {
    ...budget,
    calculated: {
      actualSpent,
      plannedTotal,
      remaining,
      isOverBudget,
      percentUsed: (actualSpent / budget.totalBudget) * 100
    }
  };
};

/**
 * Update budget
 */
export const updateBudget = async (
  budgetId: string,
  userId: string,
  data: UpdateBudgetData
) => {
  const existing = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { trip: true }
  });

  if (!existing) {
    throw new Error('Budget not found');
  }

  if (existing.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const budget = await prisma.budget.update({
    where: { id: budgetId },
    data,
    include: {
      expenses: {
        orderBy: { date: 'desc' }
      }
    }
  });

  return budget;
};

/**
 * Delete budget
 */
export const deleteBudget = async (budgetId: string, userId: string) => {
  const existing = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { trip: true }
  });

  if (!existing) {
    throw new Error('Budget not found');
  }

  if (existing.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  await prisma.budget.delete({
    where: { id: budgetId }
  });

  return { message: 'Budget deleted successfully' };
};

/**
 * Add expense to budget
 */
export const addExpense = async (userId: string, data: CreateExpenseData) => {
  // Verify access
  const budget = await prisma.budget.findUnique({
    where: { id: data.budgetId },
    include: { trip: true }
  });

  if (!budget) {
    throw new Error('Budget not found');
  }

  if (budget.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const expense = await prisma.expense.create({
    data: {
      ...data,
      currency: data.currency || budget.currency
    }
  });

  return expense;
};

/**
 * Update expense
 */
export const updateExpense = async (
  expenseId: string,
  userId: string,
  data: Partial<Omit<CreateExpenseData, 'budgetId'>>
) => {
  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      budget: { include: { trip: true } }
    }
  });

  if (!existing) {
    throw new Error('Expense not found');
  }

  if (existing.budget.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data
  });

  return expense;
};

/**
 * Delete expense
 */
export const deleteExpense = async (expenseId: string, userId: string) => {
  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      budget: { include: { trip: true } }
    }
  });

  if (!existing) {
    throw new Error('Expense not found');
  }

  if (existing.budget.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  await prisma.expense.delete({
    where: { id: expenseId }
  });

  return { message: 'Expense deleted successfully' };
};

/**
 * Get budget breakdown by category
 */
export const getBudgetBreakdown = async (tripId: string, userId?: string) => {
  const budget = await getTripBudget(tripId, userId);
  
  if (!budget) {
    return null;
  }

  // Group expenses by category
  const expensesByCategory = budget.expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = 0;
    }
    acc[exp.category] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate percentages
  const breakdown = {
    planned: {
      accommodation: { amount: budget.accommodation, percentage: (budget.accommodation / budget.totalBudget) * 100 },
      transportation: { amount: budget.transportation, percentage: (budget.transportation / budget.totalBudget) * 100 },
      food: { amount: budget.food, percentage: (budget.food / budget.totalBudget) * 100 },
      activities: { amount: budget.activities, percentage: (budget.activities / budget.totalBudget) * 100 },
      shopping: { amount: budget.shopping, percentage: (budget.shopping / budget.totalBudget) * 100 },
      emergency: { amount: budget.emergency, percentage: (budget.emergency / budget.totalBudget) * 100 },
      other: { amount: budget.other, percentage: (budget.other / budget.totalBudget) * 100 }
    },
    actual: expensesByCategory,
    comparison: Object.keys(expensesByCategory).map(category => ({
      category,
      planned: (budget as Record<string, number>)[category.toLowerCase()] || 0,
      actual: expensesByCategory[category],
      difference: ((budget as Record<string, number>)[category.toLowerCase()] || 0) - expensesByCategory[category]
    }))
  };

  return breakdown;
};

/**
 * Get daily spending for a trip
 */
export const getDailySpending = async (tripId: string, userId?: string) => {
  const budget = await getTripBudget(tripId, userId);
  
  if (!budget) {
    return null;
  }

  // Get trip duration
  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!trip) {
    return null;
  }

  const tripDays = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const dailyBudget = budget.totalBudget / tripDays;

  // Group expenses by date
  const expensesByDate = budget.expenses.reduce((acc, exp) => {
    const dateKey = new Date(exp.date).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey] += exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    tripDays,
    dailyBudget,
    spendingByDate: expensesByDate,
    averageDaily: budget.calculated.actualSpent / tripDays
  };
};

/**
 * Get expense categories
 */
export const getExpenseCategories = () => {
  return Object.values(ExpenseCategory);
};
