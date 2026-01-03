/**
 * Admin Routes
 * Admin dashboard and analytics
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

/**
 * GET /api/admin/stats
 * Get overall platform statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalTrips,
      totalCities,
      totalActivities,
      recentUsers,
      recentTrips
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.trip.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalTrips,
      totalCities,
      totalActivities,
      recentUsers,
      recentTrips,
      avgTripsPerUser: totalUsers > 0 ? (totalTrips / totalUsers).toFixed(2) : 0,
      avgCitiesPerTrip: totalTrips > 0 ? (totalCities / totalTrips).toFixed(2) : 0
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get stats';
    return sendError(res, message, 500);
  }
});

/**
 * GET /api/admin/popular-destinations
 * Get most popular destinations
 */
router.get('/popular-destinations', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const destinations = await prisma.city.groupBy({
      by: ['name', 'country'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    return sendSuccess(res, destinations.map(d => ({
      city: d.name,
      country: d.country,
      tripCount: d._count.id
    })));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get destinations';
    return sendError(res, message, 500);
  }
});

/**
 * GET /api/admin/user-growth
 * Get user growth over time
 */
router.get('/user-growth', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const growth: Record<string, number> = {};
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      growth[date] = (growth[date] || 0) + 1;
    });

    return sendSuccess(res, Object.entries(growth).map(([date, count]) => ({
      date,
      count
    })));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get growth data';
    return sendError(res, message, 500);
  }
});

/**
 * GET /api/admin/trip-analytics
 * Get trip analytics
 */
router.get('/trip-analytics', async (req: Request, res: Response) => {
  try {
    const [
      statusBreakdown,
      avgTripDuration,
      tripsPerMonth
    ] = await Promise.all([
      // Status breakdown
      prisma.trip.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      // Average trip duration (rough calculation)
      prisma.trip.findMany({
        select: {
          startDate: true,
          endDate: true
        }
      }),
      // Trips per month (last 6 months)
      prisma.trip.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          createdAt: true
        }
      })
    ]);

    // Calculate average duration
    let totalDuration = 0;
    avgTripDuration.forEach(trip => {
      const duration = Math.ceil(
        (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDuration += duration;
    });
    const avgDays = avgTripDuration.length > 0 ? (totalDuration / avgTripDuration.length).toFixed(1) : 0;

    // Group trips by month
    const monthlyTrips: Record<string, number> = {};
    tripsPerMonth.forEach(trip => {
      const month = trip.createdAt.toISOString().slice(0, 7);
      monthlyTrips[month] = (monthlyTrips[month] || 0) + 1;
    });

    return sendSuccess(res, {
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id
      })),
      averageTripDuration: avgDays,
      tripsPerMonth: Object.entries(monthlyTrips).map(([month, count]) => ({
        month,
        count
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return sendError(res, message, 500);
  }
});

/**
 * GET /api/admin/activity-categories
 * Get activity category distribution
 */
router.get('/activity-categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.activity.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return sendSuccess(res, categories.map(c => ({
      category: c.category,
      count: c._count.id
    })));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get categories';
    return sendError(res, message, 500);
  }
});

/**
 * POST /api/admin/seed-destinations
 * Seed popular destinations (one-time setup)
 */
router.post('/seed-destinations', async (req: Request, res: Response) => {
  try {
    const destinations = [
      { name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, costIndex: 4, popularity: 95, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', bestTimeToVisit: ['April', 'May', 'September', 'October'], tags: ['romantic', 'culture', 'food'] },
      { name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, costIndex: 4, popularity: 92, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', bestTimeToVisit: ['March', 'April', 'October', 'November'], tags: ['culture', 'food', 'technology'] },
      { name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.0060, costIndex: 5, popularity: 90, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', bestTimeToVisit: ['April', 'May', 'September', 'October'], tags: ['city', 'culture', 'shopping'] },
      { name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, costIndex: 5, popularity: 88, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', bestTimeToVisit: ['May', 'June', 'September'], tags: ['history', 'culture', 'museums'] },
      { name: 'Rome', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, costIndex: 3, popularity: 87, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', bestTimeToVisit: ['April', 'May', 'September', 'October'], tags: ['history', 'food', 'architecture'] },
      { name: 'Barcelona', country: 'Spain', countryCode: 'ES', latitude: 41.3851, longitude: 2.1734, costIndex: 3, popularity: 85, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded', bestTimeToVisit: ['May', 'June', 'September'], tags: ['beach', 'architecture', 'nightlife'] },
      { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708, costIndex: 4, popularity: 84, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', bestTimeToVisit: ['November', 'December', 'January', 'February'], tags: ['luxury', 'shopping', 'modern'] },
      { name: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, costIndex: 4, popularity: 82, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd', bestTimeToVisit: ['February', 'March', 'April'], tags: ['food', 'modern', 'clean'] },
      { name: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, costIndex: 4, popularity: 80, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9', bestTimeToVisit: ['September', 'October', 'November'], tags: ['beach', 'nature', 'city'] },
      { name: 'Bali', country: 'Indonesia', countryCode: 'ID', latitude: -8.3405, longitude: 115.0920, costIndex: 2, popularity: 78, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', bestTimeToVisit: ['April', 'May', 'June', 'September'], tags: ['beach', 'spiritual', 'nature'] }
    ];

    const result = await prisma.popularDestination.createMany({
      data: destinations,
      skipDuplicates: true
    });

    return sendSuccess(res, { created: result.count }, 'Destinations seeded successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to seed destinations';
    return sendError(res, message, 500);
  }
});

export default router;
