/**
 * Trip Calendar / Timeline Page
 * Calendar-based or vertical timeline view of the full itinerary
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiClock, FiMapPin, FiDollarSign, FiArrowLeft,
  FiChevronLeft, FiChevronRight, FiEdit3
} from 'react-icons/fi';
import { getTrip } from '../services/trip.service';
import type { Trip } from '../services/trip.service';
import toast from 'react-hot-toast';

const CalendarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

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
        if (response.data.startDate) {
          setCurrentMonth(new Date(response.data.startDate));
        }
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getActivitiesForDate = (date: Date) => {
    if (!trip?.cities) return [];
    const dateStr = date.toISOString().split('T')[0];
    const activities: Array<{ city: any; activity: any }> = [];
    
    trip.cities.forEach(city => {
      city.activities?.forEach(activity => {
        const activityDate = new Date(activity.date).toISOString().split('T')[0];
        if (activityDate === dateStr) {
          activities.push({ city, activity });
        }
      });
    });
    
    return activities;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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
          <p className="text-slate-600 dark:text-slate-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Group activities by day for timeline view
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
              {trip.name} - Calendar
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {monthName}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square" />;
                }
                const activities = getActivitiesForDate(date);
                const isInTripRange = trip.startDate && trip.endDate &&
                  date >= new Date(trip.startDate) && date <= new Date(trip.endDate);
                
                return (
                  <div
                    key={index}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                      isInTripRange
                        ? activities.length > 0
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      {date.getDate()}
                    </div>
                    {activities.length > 0 && (
                      <div className="space-y-1">
                        {activities.slice(0, 2).map((item, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-indigo-500 text-white px-1 py-0.5 rounded truncate"
                            title={item.activity.name}
                          >
                            {item.activity.name}
                          </div>
                        ))}
                        {activities.length > 2 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            +{activities.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDays.length > 0 ? (
              sortedDays.map((dateKey, index) => {
                const date = new Date(dateKey);
                const activities = activitiesByDay[dateKey];
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {formatDate(date)}
                      </h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {activities.map((item, actIndex) => (
                        <div
                          key={actIndex}
                          className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {item.activity.name}
                              </h3>
                              <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
                                {item.city.name}
                              </span>
                            </div>
                            {item.activity.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {item.activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              {item.activity.startTime && (
                                <div className="flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  <span>{formatTime(item.activity.startTime)}</span>
                                </div>
                              )}
                              {item.activity.cost > 0 && (
                                <div className="flex items-center gap-1">
                                  <FiDollarSign className="w-3 h-3" />
                                  <span>{item.activity.currency} {item.activity.cost}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
                <FiCalendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No activities scheduled
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Add activities to see them on the calendar
                </p>
                <Link to={`/trips/${trip.id}/itinerary`}>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Build Itinerary
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CalendarPage;

