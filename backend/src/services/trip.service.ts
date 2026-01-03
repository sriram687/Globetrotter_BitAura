/**
 * Trip Service
 * Handles trip CRUD operations
 */

import { prisma } from '../index';
import { generateShareToken } from '../utils/jwt.utils';

interface CreateTripData {
  name: string;
  description?: string;
  coverImage?: string;
  startDate: Date;
  endDate: Date;
  totalBudget?: number;
  currency?: string;
  tags?: string[];
}

interface UpdateTripData extends Partial<CreateTripData> {
  status?: 'PLANNING' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  isPublic?: boolean;
}

/**
 * Create a new trip
 */
export const createTrip = async (userId: string, data: CreateTripData) => {
  const trip = await prisma.trip.create({
    data: {
      ...data,
      userId
    },
    include: {
      cities: true,
      budget: true
    }
  });

  return trip;
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = { userId };
  
  if (status) {
    where.status = status;
  }

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take: limit,
      include: {
        cities: {
          orderBy: { order: 'asc' },
          take: 3
        },
        budget: true,
        _count: {
          select: { cities: true }
        }
      },
      orderBy: { startDate: 'desc' }
    }),
    prisma.trip.count({ where })
  ]);

  return {
    trips,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (tripId: string, userId?: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      cities: {
        orderBy: { order: 'asc' },
        include: {
          activities: {
            orderBy: [{ date: 'asc' }, { order: 'asc' }]
          }
        }
      },
      budget: {
        include: {
          expenses: {
            orderBy: { date: 'desc' }
          }
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Check access
  if (!trip.isPublic && trip.userId !== userId) {
    throw new Error('Access denied');
  }

  return trip;
};

/**
 * Update a trip
 */
export const updateTrip = async (
  tripId: string,
  userId: string,
  data: UpdateTripData
) => {
  // Verify ownership
  const existing = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!existing) {
    throw new Error('Trip not found');
  }

  if (existing.userId !== userId) {
    throw new Error('Access denied');
  }

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data,
    include: {
      cities: {
        orderBy: { order: 'asc' }
      },
      budget: true
    }
  });

  return trip;
};

/**
 * Delete a trip
 */
export const deleteTrip = async (tripId: string, userId: string) => {
  // Verify ownership
  const existing = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!existing) {
    throw new Error('Trip not found');
  }

  if (existing.userId !== userId) {
    throw new Error('Access denied');
  }

  await prisma.trip.delete({
    where: { id: tripId }
  });

  return { message: 'Trip deleted successfully' };
};

/**
 * Generate share link for a trip
 */
export const generateShareLink = async (tripId: string, userId: string) => {
  // Verify ownership
  const existing = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!existing) {
    throw new Error('Trip not found');
  }

  if (existing.userId !== userId) {
    throw new Error('Access denied');
  }

  const shareToken = generateShareToken();

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      shareToken,
      isPublic: true
    }
  });

  return {
    shareToken: trip.shareToken,
    shareUrl: `${process.env.FRONTEND_URL}/shared/${trip.shareToken}`
  };
};

/**
 * Get trip by share token (public)
 */
export const getTripByShareToken = async (shareToken: string) => {
  const trip = await prisma.trip.findUnique({
    where: { shareToken },
    include: {
      cities: {
        orderBy: { order: 'asc' },
        include: {
          activities: {
            orderBy: [{ date: 'asc' }, { order: 'asc' }]
          }
        }
      },
      budget: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  if (!trip || !trip.isPublic) {
    throw new Error('Trip not found or not public');
  }

  return trip;
};

/**
 * Copy a shared trip to user's account
 */
export const copyTrip = async (shareToken: string, userId: string) => {
  const originalTrip = await getTripByShareToken(shareToken);

  // Create new trip
  const newTrip = await prisma.trip.create({
    data: {
      name: `${originalTrip.name} (Copy)`,
      description: originalTrip.description,
      coverImage: originalTrip.coverImage,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      totalBudget: originalTrip.totalBudget,
      currency: originalTrip.currency,
      tags: originalTrip.tags,
      userId
    }
  });

  // Copy cities and activities
  for (const city of originalTrip.cities) {
    const newCity = await prisma.city.create({
      data: {
        name: city.name,
        country: city.country,
        countryCode: city.countryCode,
        latitude: city.latitude,
        longitude: city.longitude,
        image: city.image,
        arrivalDate: city.arrivalDate,
        departureDate: city.departureDate,
        order: city.order,
        notes: city.notes,
        tripId: newTrip.id
      }
    });

    // Copy activities
    for (const activity of city.activities) {
      await prisma.activity.create({
        data: {
          name: activity.name,
          description: activity.description,
          category: activity.category,
          location: activity.location,
          address: activity.address,
          latitude: activity.latitude,
          longitude: activity.longitude,
          image: activity.image,
          date: activity.date,
          startTime: activity.startTime,
          endTime: activity.endTime,
          duration: activity.duration,
          cost: activity.cost,
          currency: activity.currency,
          order: activity.order,
          cityId: newCity.id
        }
      });
    }
  }

  // Copy budget
  if (originalTrip.budget) {
    await prisma.budget.create({
      data: {
        totalBudget: originalTrip.budget.totalBudget,
        currency: originalTrip.budget.currency,
        accommodation: originalTrip.budget.accommodation,
        transportation: originalTrip.budget.transportation,
        food: originalTrip.budget.food,
        activities: originalTrip.budget.activities,
        shopping: originalTrip.budget.shopping,
        emergency: originalTrip.budget.emergency,
        other: originalTrip.budget.other,
        tripId: newTrip.id
      }
    });
  }

  return getTripById(newTrip.id, userId);
};

/**
 * Get upcoming trips
 */
export const getUpcomingTrips = async (userId: string, limit: number = 5) => {
  const trips = await prisma.trip.findMany({
    where: {
      userId,
      startDate: {
        gte: new Date()
      },
      status: {
        in: ['PLANNING', 'UPCOMING']
      }
    },
    take: limit,
    orderBy: { startDate: 'asc' },
    include: {
      cities: {
        orderBy: { order: 'asc' },
        take: 1
      },
      _count: {
        select: { cities: true }
      }
    }
  });

  return trips;
};
