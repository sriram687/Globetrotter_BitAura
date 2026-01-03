/**
 * User Service
 * Handles user profile management
 */

import { prisma } from '../index';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  country?: string;
  preferences?: Record<string, unknown>;
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      phone: true,
      country: true,
      preferences: true,
      role: true,
      createdAt: true,
      _count: {
        select: { trips: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, data: UpdateProfileData) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      phone: true,
      country: true,
      preferences: true,
      role: true,
      updatedAt: true
    }
  });

  return user;
};

/**
 * Delete user account
 */
export const deleteAccount = async (userId: string) => {
  // Delete user (cascades to trips, etc.)
  await prisma.user.delete({
    where: { id: userId }
  });

  return { message: 'Account deleted successfully' };
};

/**
 * Get user's travel stats
 */
export const getUserStats = async (userId: string) => {
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      cities: {
        include: {
          activities: true
        }
      },
      budget: true
    }
  });

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
  const upcomingTrips = trips.filter(t => t.status === 'UPCOMING' || t.status === 'PLANNING').length;
  
  const allCities = trips.flatMap(t => t.cities);
  const totalCities = allCities.length;
  const uniqueCountries = [...new Set(allCities.map(c => c.country))].length;
  
  const totalActivities = allCities.reduce((sum, city) => sum + city.activities.length, 0);
  
  const totalSpent = trips.reduce((sum, trip) => {
    if (trip.budget) {
      return sum + (
        trip.budget.accommodation +
        trip.budget.transportation +
        trip.budget.food +
        trip.budget.activities +
        trip.budget.shopping +
        trip.budget.other
      );
    }
    return sum;
  }, 0);

  return {
    totalTrips,
    completedTrips,
    upcomingTrips,
    totalCities,
    uniqueCountries,
    totalActivities,
    totalSpent
  };
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: { trips: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
