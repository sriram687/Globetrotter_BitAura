/**
 * AI Service
 * API calls for AI-powered suggestions
 */

import api from './api';
import type { ApiResponse } from './api';

export interface TripSuggestion {
  bestTimeToVisit: string;
  attractions: Array<{
    name: string;
    description: string;
    estimatedCost: number;
    duration: string;
  }>;
  dailyItinerary: Array<{
    day: number;
    activities: Array<{
      name: string;
      time: string;
      description: string;
      cost: number;
    }>;
  }>;
  foodRecommendations: Array<{
    name: string;
    type: string;
    priceRange: string;
  }>;
  budgetBreakdown: {
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
    total: number;
  };
  tips: string[];
  rawSuggestion?: string;
}

export interface ActivitySuggestion {
  activities: Array<{
    name: string;
    category: string;
    description: string;
    estimatedCost: number;
    duration: number;
    address: string;
    tips: string;
    rating: number;
  }>;
  rawSuggestion?: string;
}

export interface BudgetRecommendation {
  dailyBudget: {
    accommodation: { low: number; mid: number; high: number };
    food: { low: number; mid: number; high: number };
    transport: { low: number; mid: number; high: number };
    activities: { low: number; mid: number; high: number };
    misc: { low: number; mid: number; high: number };
  };
  totalEstimate: { low: number; mid: number; high: number };
  savingTips: string[];
  splurgeWorthy: string[];
  rawSuggestion?: string;
}

// Get trip suggestions
export const getTripSuggestions = async (params: {
  destination: string;
  duration: number;
  budget?: number;
  interests?: string[];
  travelStyle?: string;
}): Promise<ApiResponse<TripSuggestion>> => {
  const response = await api.post<ApiResponse<TripSuggestion>>('/ai/trip-suggestions', params);
  return response.data;
};

// Optimize itinerary
export const optimizeItinerary = async (params: {
  cities: string[];
  totalDays: number;
  interests?: string[];
  budget?: number;
}): Promise<ApiResponse<unknown>> => {
  const response = await api.post<ApiResponse<unknown>>('/ai/optimize-itinerary', params);
  return response.data;
};

// Get activity suggestions
export const getActivitySuggestions = async (params: {
  city: string;
  country: string;
  category?: string;
  budget?: number;
}): Promise<ApiResponse<ActivitySuggestion>> => {
  const response = await api.post<ApiResponse<ActivitySuggestion>>('/ai/activity-suggestions', params);
  return response.data;
};

// Get budget recommendations
export const getBudgetRecommendations = async (params: {
  destination: string;
  duration: number;
  travelStyle?: string;
}): Promise<ApiResponse<BudgetRecommendation>> => {
  const response = await api.post<ApiResponse<BudgetRecommendation>>('/ai/budget-recommendations', params);
  return response.data;
};

// Chat with AI assistant
export const chatWithAI = async (
  message: string,
  context?: { tripName?: string; destination?: string; dates?: string }
): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/ai/chat', { message, context });
  return response.data;
};
