/**
 * Admin Dashboard Page
 * Admin-only interface to track user trends, trip data, and platform usage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiMap, FiActivity, FiTrendingUp, FiBarChart2,
  FiPieChart, FiGlobe, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  recentUsers: number;
  recentTrips: number;
  avgTripsPerUser: string;
  avgCitiesPerTrip: string;
}

interface PopularDestination {
  city: string;
  country: string;
  tripCount: number;
}

interface UserGrowth {
  date: string;
  count: number;
}

interface TripAnalytics {
  statusBreakdown: Array<{ status: string; count: number }>;
  averageTripDuration: string;
  tripsPerMonth: Array<{ month: string; count: number }>;
}

interface ActivityCategory {
  category: string;
  count: number;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [tripAnalytics, setTripAnalytics] = useState<TripAnalytics | null>(null);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }

    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, destinationsRes, growthRes, analyticsRes, categoriesRes] = await Promise.all([
        api.get<ApiResponse<AdminStats>>('/admin/stats'),
        api.get<ApiResponse<PopularDestination[]>>('/admin/popular-destinations?limit=10'),
        api.get<ApiResponse<UserGrowth[]>>('/admin/user-growth?days=30'),
        api.get<ApiResponse<TripAnalytics>>('/admin/trip-analytics'),
        api.get<ApiResponse<ActivityCategory[]>>('/admin/activity-categories'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data!);
      if (destinationsRes.data.success) setPopularDestinations(destinationsRes.data.data || []);
      if (growthRes.data.success) setUserGrowth(growthRes.data.data || []);
      if (analyticsRes.data.success) setTripAnalytics(analyticsRes.data.data!);
      if (categoriesRes.data.success) setActivityCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-pink-300/5 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/15 via-indigo-300/8 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                +{stats.recentUsers} in last 7 days
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Trips</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalTrips}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiMap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                +{stats.recentTrips} in last 7 days
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Cities</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCities}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiGlobe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Activities</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalActivities}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <FiActivity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Destinations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FiGlobe className="w-5 h-5" />
              Top Destinations
            </h2>
            <div className="space-y-3">
              {popularDestinations.map((dest, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{dest.city}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{dest.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{dest.tripCount}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">trips</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trip Status Breakdown */}
          {tripAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FiPieChart className="w-5 h-5" />
                Trip Status
              </h2>
              <div className="space-y-3">
                {tripAnalytics.statusBreakdown.map((status, index) => {
                  const total = tripAnalytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? (status.count / total) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{status.status}</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {status.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Activity Categories */}
        {activityCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5" />
              Activity Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activityCategories.map((cat, index) => (
                <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{cat.category}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{cat.count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* User Growth Chart */}
        {userGrowth.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5" />
              User Growth (Last 30 Days)
            </h2>
            <div className="h-64 flex items-end gap-2">
              {userGrowth.map((day, index) => {
                const maxCount = Math.max(...userGrowth.map(d => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.count} users`}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;

