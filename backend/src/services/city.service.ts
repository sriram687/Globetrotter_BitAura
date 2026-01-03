/**
 * City Service
 * Handles city operations within trips
 */

import { prisma } from '../index';

interface CreateCityData {
  tripId: string;
  name: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  arrivalDate: Date;
  departureDate: Date;
  notes?: string;
  accommodation?: string;
  transportMode?: string;
  transportCost?: number;
}

interface UpdateCityData extends Partial<Omit<CreateCityData, 'tripId'>> {
  order?: number;
}

/**
 * Add a city to a trip
 */
export const addCity = async (userId: string, data: CreateCityData) => {
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

  // Get current max order
  const lastCity = await prisma.city.findFirst({
    where: { tripId: data.tripId },
    orderBy: { order: 'desc' }
  });

  const order = lastCity ? lastCity.order + 1 : 0;

  const city = await prisma.city.create({
    data: {
      ...data,
      order
    },
    include: {
      activities: true
    }
  });

  return city;
};

/**
 * Get all cities for a trip
 */
export const getTripCities = async (tripId: string, userId?: string) => {
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

  const cities = await prisma.city.findMany({
    where: { tripId },
    orderBy: { order: 'asc' },
    include: {
      activities: {
        orderBy: [{ date: 'asc' }, { order: 'asc' }]
      },
      _count: {
        select: { activities: true }
      }
    }
  });

  return cities;
};

/**
 * Get a single city
 */
export const getCityById = async (cityId: string, userId?: string) => {
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: {
      trip: true,
      activities: {
        orderBy: [{ date: 'asc' }, { order: 'asc' }]
      }
    }
  });

  if (!city) {
    throw new Error('City not found');
  }

  // Verify access
  if (!city.trip.isPublic && city.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  return city;
};

/**
 * Update a city
 */
export const updateCity = async (
  cityId: string,
  userId: string,
  data: UpdateCityData
) => {
  // Get city with trip
  const existing = await prisma.city.findUnique({
    where: { id: cityId },
    include: { trip: true }
  });

  if (!existing) {
    throw new Error('City not found');
  }

  if (existing.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  const city = await prisma.city.update({
    where: { id: cityId },
    data,
    include: {
      activities: {
        orderBy: [{ date: 'asc' }, { order: 'asc' }]
      }
    }
  });

  return city;
};

/**
 * Delete a city
 */
export const deleteCity = async (cityId: string, userId: string) => {
  const existing = await prisma.city.findUnique({
    where: { id: cityId },
    include: { trip: true }
  });

  if (!existing) {
    throw new Error('City not found');
  }

  if (existing.trip.userId !== userId) {
    throw new Error('Access denied');
  }

  await prisma.city.delete({
    where: { id: cityId }
  });

  return { message: 'City deleted successfully' };
};

/**
 * Reorder cities in a trip
 */
export const reorderCities = async (
  tripId: string,
  userId: string,
  cityOrders: Array<{ id: string; order: number }>
) => {
  // Verify trip ownership
  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  if (trip.userId !== userId) {
    throw new Error('Access denied');
  }

  // Update all cities in a transaction
  await prisma.$transaction(
    cityOrders.map(({ id, order }) =>
      prisma.city.update({
        where: { id },
        data: { order }
      })
    )
  );

  // Return updated cities
  const cities = await getTripCities(tripId, userId);
  return cities;
};

/**
 * Search popular destinations
 */
export const searchDestinations = async (
  query: string,
  limit: number = 10
) => {
  const destinations = await prisma.popularDestination.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { country: { contains: query, mode: 'insensitive' } }
      ]
    },
    take: limit,
    orderBy: { popularity: 'desc' }
  });

  return destinations;
};

/**
 * Get popular destinations
 */
export const getPopularDestinations = async (limit: number = 10) => {
  const destinations = await prisma.popularDestination.findMany({
    take: limit,
    orderBy: { popularity: 'desc' }
  });

  return destinations;
};

/**
 * Calculate city duration in days
 */
export const getCityDuration = (
  arrivalDate: Date,
  departureDate: Date
): number => {
  const diffTime = Math.abs(
    new Date(departureDate).getTime() - new Date(arrivalDate).getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
