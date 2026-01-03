/**
 * Activity Service
 * Handles activity operations within cities
 */

import { prisma } from '../index';
import { ActivityCategory } from '@prisma/client';

interface CreateActivityData {
  cityId: string;
  name: string;
  description?: string;
  category: ActivityCategory;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  duration?: number;
  cost?: number;
  currency?: string;
  notes?: string;
}

interface UpdateActivityData extends Partial<Omit<CreateActivityData, 'cityId'>> {
  order?: number;
  isBooked?: boolean;
  bookingRef?: string;
  rating?: number;
}

/**
 * Add an activity to a city
 */
export const addActivity = async (userId: string, data: CreateActivityData) => {
  // Verify access via city -> trip
  const city = await prisma.city.findUnique({
    where: { id: data.cityId },
    include: { trip: true }
  });

  if (!city) {
    throw new Error('City not found');
  }

  if (city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  // Get current max order
  const lastActivity = await prisma.activity.findFirst({
    where: { cityId: data.cityId },
    orderBy: { order: 'desc' }
  });

  const order = lastActivity ? lastActivity.order + 1 : 0;

  const activity = await prisma.activity.create({
    data: {
      ...data,
      order,
      cost: data.cost || 0,
      currency: data.currency || 'USD'
    }
  });

  return activity;
};

/**
 * Get all activities for a city
 */
export const getCityActivities = async (cityId: string, userId?: string) => {
  // Verify access
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { trip: true }
  });

  if (!city) {
    throw new Error('City not found');
  }

  if (!city.trip.isPublic && city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const activities = await prisma.activity.findMany({
    where: { cityId },
    orderBy: [{ date: 'asc' }, { order: 'asc' }]
  });

  return activities;
};

/**
 * Get a single activity
 */
export const getActivityById = async (activityId: string, userId?: string) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      city: {
        include: { trip: true }
      }
    }
  });

  if (!activity) {
    throw new Error('Activity not found');
  }

  if (!activity.city.trip.isPublic && activity.city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  return activity;
};

/**
 * Update an activity
 */
export const updateActivity = async (
  activityId: string,
  userId: string,
  data: UpdateActivityData
) => {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      city: { include: { trip: true } }
    }
  });

  if (!existing) {
    throw new Error('Activity not found');
  }

  if (existing.city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data
  });

  return activity;
};

/**
 * Delete an activity
 */
export const deleteActivity = async (activityId: string, userId: string) => {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      city: { include: { trip: true } }
    }
  });

  if (!existing) {
    throw new Error('Activity not found');
  }

  if (existing.city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  await prisma.activity.delete({
    where: { id: activityId }
  });

  return { message: 'Activity deleted successfully' };
};

/**
 * Reorder activities in a city
 */
export const reorderActivities = async (
  cityId: string,
  userId: string,
  activityOrders: Array<{ id: string; order: number }>
) => {
  // Verify access
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: { trip: true }
  });

  if (!city) {
    throw new Error('City not found');
  }

  if (city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  // Update all activities
  await prisma.$transaction(
    activityOrders.map(({ id, order }) =>
      prisma.activity.update({
        where: { id },
        data: { order }
      })
    )
  );

  return getCityActivities(cityId, userId);
};

/**
 * Search activity templates
 */
export const searchActivityTemplates = async (
  destination: string,
  category?: ActivityCategory,
  limit: number = 20
) => {
  const where: Record<string, unknown> = {
    destination: { contains: destination, mode: 'insensitive' }
  };

  if (category) {
    where.category = category;
  }

  const templates = await prisma.activityTemplate.findMany({
    where,
    take: limit,
    orderBy: { rating: 'desc' }
  });

  return templates;
};

/**
 * Get activities grouped by day
 */
export const getActivitiesByDay = async (tripId: string, userId?: string) => {
  // Get all activities for the trip
  const cities = await prisma.city.findMany({
    where: { tripId },
    include: {
      activities: {
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }, { order: 'asc' }]
      }
    },
    orderBy: { order: 'asc' }
  });

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

  // Group by date
  const activitiesByDay: Record<string, Array<{
    activity: typeof cities[0]['activities'][0];
    city: { id: string; name: string; country: string };
  }>> = {};

  for (const city of cities) {
    for (const activity of city.activities) {
      const dateKey = new Date(activity.date).toISOString().split('T')[0];
      
      if (!activitiesByDay[dateKey]) {
        activitiesByDay[dateKey] = [];
      }
      
      activitiesByDay[dateKey].push({
        activity,
        city: {
          id: city.id,
          name: city.name,
          country: city.country
        }
      });
    }
  }

  return activitiesByDay;
};

/**
 * Get activity categories
 */
export const getActivityCategories = () => {
  return Object.values(ActivityCategory);
};
