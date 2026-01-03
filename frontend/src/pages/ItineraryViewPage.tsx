/**
 * Itinerary View Page
 * Visual representation of the completed trip itinerary
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiMapPin, FiClock, FiDollarSign,
  FiArrowLeft, FiGrid, FiList, FiEye
} from 'react-icons/fi';
import { getTrip } from '../services/trip.service';
import type { Trip } from '../services/trip.service';
import toast from 'react-hot-toast';

type ViewMode = 'calendar' | 'list';

const ItineraryViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    if (!id) {
      navigate('/trips');
      return;
    }

    fetchTrip();
  }, [id, navigate]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await getTrip(id!);
      if (response.success && response.data) {
        setTrip(response.data);
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Trip Not Found</h1>
          <Link to="/trips">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Back to My Trips</button>
          </Link>
        </div>
      </div>
    );
  }

  // Group activities by day
  const activitiesByDay: Record<string, Array<{ city: any; activity: any }>> = {};
  trip.cities?.forEach(city => {
    city.activities?.forEach(activity => {
      const dateKey = new Date(activity.date).toISOString().split('T')[0];
      if (!activitiesByDay[dateKey]) {
        activitiesByDay[dateKey] = [];
      }
      activitiesByDay[dateKey].push({ city, activity });
    });
  });

  const sortedDays = Object.keys(activitiesByDay).sort();

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to={`/trips/${trip.id}`}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Trip
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {trip.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Complete itinerary overview
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'} transition-colors`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'} transition-colors`}
            >
              <FiCalendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {trip.cities && trip.cities.length > 0 ? (
              trip.cities.map((city, cityIndex) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cityIndex * 0.1 }}
                  className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden"
                >
                  {/* City Header */}
                  <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                        {cityIndex + 1}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{city.name}</h2>
                        <p className="text-indigo-100">{city.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>
                          {formatDate(city.arrivalDate)} - {formatDate(city.departureDate)}
                        </span>
                      </div>
                      {city.accommodation && (
                        <div className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          <span>{city.accommodation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="p-6">
                    {city.activities && city.activities.length > 0 ? (
                      <div className="space-y-4">
                        {city.activities.map((activity, actIndex) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                          >
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiEye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {activity.name}
                              </h3>
                              {activity.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {activity.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3" />
                                  <span>{formatDate(activity.date)}</span>
                                </div>
                                {activity.startTime && (
                                  <div className="flex items-center gap-1">
                                    <FiClock className="w-3 h-3" />
                                    <span>{formatTime(activity.startTime)}</span>
                                  </div>
                                )}
                                {activity.cost > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FiDollarSign className="w-3 h-3" />
                                    <span>{activity.currency} {activity.cost}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <p>No activities planned for this city</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <FiMapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No itinerary yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start building your itinerary
                </p>
                <Link to={`/trips/${trip.id}/itinerary`}>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Build Itinerary
                  </button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6">
            <p className="text-center text-slate-500 dark:text-slate-400">
              Calendar view coming soon...
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItineraryViewPage;

