/**
 * Trip Service
 * API calls for trip management
 */

import api from './api';
import type { ApiResponse } from './api';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  isPublic: boolean;
  shareToken?: string;
  totalBudget?: number;
  currency: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  cities?: City[];
  budget?: Budget;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isShared?: boolean;
  sharedPermission?: 'VIEW' | 'EDIT';
  sharedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  sharedWith?: Array<{
    id: string;
    userId: string;
    permission: 'VIEW' | 'EDIT';
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
  _count?: {
    cities: number;
  };
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  arrivalDate: string;
  departureDate: string;
  order: number;
  notes?: string;
  accommodation?: string;
  transportMode?: string;
  transportCost?: number;
  tripId: string;
  activities?: Activity[];
  _count?: {
    activities: number;
  };
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category: ActivityCategory;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  cost: number;
  currency: string;
  isBooked: boolean;
  bookingRef?: string;
  notes?: string;
  rating?: number;
  order: number;
  cityId: string;
}

export type ActivityCategory = 
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'SHOPPING'
  | 'NIGHTLIFE'
  | 'RELAXATION'
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'OTHER';

export interface Budget {
  id: string;
  totalBudget: number;
  currency: string;
  accommodation: number;
  transportation: number;
  food: number;
  activities: number;
  shopping: number;
  emergency: number;
  other: number;
  notes?: string;
  tripId: string;
  expenses?: Expense[];
  calculated?: {
    actualSpent: number;
    plannedTotal: number;
    remaining: number;
    isOverBudget: boolean;
    percentUsed: number;
  };
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  receipt?: string;
  budgetId: string;
}

export interface CreateTripData {
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  totalBudget?: number;
  currency?: string;
  tags?: string[];
}

// Get all user trips
export const getUserTrips = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ApiResponse<Trip[]>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.append('status', status);
  const response = await api.get<ApiResponse<Trip[]>>(`/trips?${params}`);
  return response.data;
};

// Get upcoming trips
export const getUpcomingTrips = async (limit: number = 5): Promise<ApiResponse<Trip[]>> => {
  const response = await api.get<ApiResponse<Trip[]>>(`/trips/upcoming?limit=${limit}`);
  return response.data;
};

// Get single trip
export const getTrip = async (id: string): Promise<ApiResponse<Trip>> => {
  const response = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
  return response.data;
};

// Create trip
export const createTrip = async (data: CreateTripData): Promise<ApiResponse<Trip>> => {
  const response = await api.post<ApiResponse<Trip>>('/trips', data);
  return response.data;
};

// Update trip
export const updateTrip = async (id: string, data: Partial<CreateTripData>): Promise<ApiResponse<Trip>> => {
  const response = await api.put<ApiResponse<Trip>>(`/trips/${id}`, data);
  return response.data;
};

// Delete trip
export const deleteTrip = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/trips/${id}`);
  return response.data;
};

// Generate share link
export const generateShareLink = async (id: string): Promise<ApiResponse<{ shareToken: string; shareUrl: string }>> => {
  const response = await api.post<ApiResponse<{ shareToken: string; shareUrl: string }>>(`/trips/${id}/share`);
  return response.data;
};

// Get shared trip
export const getSharedTrip = async (token: string): Promise<ApiResponse<Trip>> => {
  const response = await api.get<ApiResponse<Trip>>(`/trips/shared/${token}`);
  return response.data;
};

// Share trip with user by email
export const shareTripWithUser = async (
  tripId: string,
  email: string,
  permission: 'VIEW' | 'EDIT' = 'VIEW'
): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/trips/${tripId}/share-with-user`, {
    email,
    permission
  });
  return response.data;
};

// Remove shared access
export const removeSharedAccess = async (
  tripId: string,
  userId: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(
    `/trips/${tripId}/share-with-user/${userId}`
  );
  return response.data;
};

// Copy shared trip
export const copySharedTrip = async (token: string): Promise<ApiResponse<Trip>> => {
  const response = await api.post<ApiResponse<Trip>>(`/trips/copy/${token}`);
  return response.data;
};

// City operations
export const addCity = async (data: Partial<City> & { tripId: string }): Promise<ApiResponse<City>> => {
  const response = await api.post<ApiResponse<City>>('/cities', data);
  return response.data;
};

export const updateCity = async (id: string, data: Partial<City>): Promise<ApiResponse<City>> => {
  const response = await api.put<ApiResponse<City>>(`/cities/${id}`, data);
  return response.data;
};

export const deleteCity = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/cities/${id}`);
  return response.data;
};

export const reorderCities = async (
  tripId: string,
  cityOrders: Array<{ id: string; order: number }>
): Promise<ApiResponse<City[]>> => {
  const response = await api.post<ApiResponse<City[]>>('/cities/reorder', { tripId, cityOrders });
  return response.data;
};

// Activity operations
export const addActivity = async (data: Partial<Activity> & { cityId: string }): Promise<ApiResponse<Activity>> => {
  const response = await api.post<ApiResponse<Activity>>('/activities', data);
  return response.data;
};

export const updateActivity = async (id: string, data: Partial<Activity>): Promise<ApiResponse<Activity>> => {
  const response = await api.put<ApiResponse<Activity>>(`/activities/${id}`, data);
  return response.data;
};

export const deleteActivity = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/activities/${id}`);
  return response.data;
};

// Budget operations
export const getTripBudget = async (tripId: string): Promise<ApiResponse<Budget | null>> => {
  const response = await api.get<ApiResponse<Budget | null>>(`/budgets/trip/${tripId}`);
  return response.data;
};

export const createBudget = async (data: Partial<Budget> & { tripId: string }): Promise<ApiResponse<Budget>> => {
  const response = await api.post<ApiResponse<Budget>>('/budgets', data);
  return response.data;
};

export const updateBudget = async (id: string, data: Partial<Budget>): Promise<ApiResponse<Budget>> => {
  const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
  return response.data;
};

export const getBudgetBreakdown = async (tripId: string): Promise<ApiResponse<unknown>> => {
  const response = await api.get<ApiResponse<unknown>>(`/budgets/trip/${tripId}/breakdown`);
  return response.data;
};

// Expense operations
export const addExpense = async (data: Partial<Expense> & { budgetId: string }): Promise<ApiResponse<Expense>> => {
  const response = await api.post<ApiResponse<Expense>>('/budgets/expenses', data);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<ApiResponse<{ message: string }>>(`/budgets/expenses/${id}`);
  return response.data;
};

// Search destinations
export const searchDestinations = async (query: string, limit: number = 10): Promise<ApiResponse<unknown[]>> => {
  const response = await api.get<ApiResponse<unknown[]>>(`/cities/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data;
};

// Get popular destinations
export const getPopularDestinations = async (limit: number = 10): Promise<ApiResponse<unknown[]>> => {
  const response = await api.get<ApiResponse<unknown[]>>(`/cities/popular?limit=${limit}`);
  return response.data;
};

// Activity categories
export const getActivityCategories = async (): Promise<ApiResponse<ActivityCategory[]>> => {
  const response = await api.get<ApiResponse<ActivityCategory[]>>('/activities/categories');
  return response.data;
};
