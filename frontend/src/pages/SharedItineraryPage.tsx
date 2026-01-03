/**
 * Shared/Public Itinerary View Page
 * Public page displaying a sharable version of an itinerary
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiMapPin, FiClock, FiDollarSign, FiShare2,
  FiCopy, FiDownload, FiHeart, FiMessageCircle, FiUsers
} from 'react-icons/fi';
import { getSharedTrip, copySharedTrip } from '../services/trip.service';
import type { Trip } from '../services/trip.service';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import wsService from '../services/websocket.service';
import { useEffect } from 'react';

const SharedItineraryPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetchSharedTrip();

    // Connect WebSocket for real-time updates if authenticated
    if (isAuthenticated && trip) {
      const userToken = localStorage.getItem('token');
      if (userToken) {
        wsService.connect(trip.id, userToken);
        
        wsService.on('trip_update', (data) => {
          toast.info('Trip updated in real-time');
          fetchSharedTrip();
        });

        wsService.on('user_joined', (data) => {
          toast.info(`${data.userName} joined the trip`);
        });

        wsService.on('message', (data) => {
          toast.info(`${data.userName}: ${data.message}`);
        });
      }
    }

    return () => {
      wsService.disconnect();
    };
  }, [token, navigate, isAuthenticated, trip?.id]);

  const fetchSharedTrip = async () => {
    try {
      setLoading(true);
      const response = await getSharedTrip(token!);
      if (response.success && response.data) {
        setTrip(response.data);
      } else {
        toast.error('Shared trip not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load shared trip:', error);
      toast.error('Failed to load shared trip');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to copy this trip');
      navigate('/login');
      return;
    }

    try {
      setCopying(true);
      const response = await copySharedTrip(token!);
      if (response.success && response.data) {
        toast.success('Trip copied to your account!');
        navigate(`/trips/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to copy trip:', error);
      toast.error('Failed to copy trip');
    } finally {
      setCopying(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
    return null;
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
        {/* Header */}
        <div className="mb-8">
          {trip.coverImage && (
            <div className="h-64 md:h-80 relative overflow-hidden rounded-2xl mb-6">
              <img
                src={trip.coverImage}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {trip.name}
              </h1>
              {trip.description && (
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                  {trip.description}
                </p>
              )}
              {trip.user && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Created by {trip.user.firstName} {trip.user.lastName}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleShare}
                leftIcon={<FiShare2 />}
              >
                Share
              </Button>
              {isAuthenticated ? (
                <Button
                  onClick={handleCopyTrip}
                  isLoading={copying}
                  leftIcon={<FiCopy />}
                >
                  Copy Trip
                </Button>
              ) : (
                <Link to="/login">
                  <Button leftIcon={<FiCopy />}>
                    Login to Copy
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Trip Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4">
            <div className="flex items-center gap-3">
              <FiCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Dates</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4">
            <div className="flex items-center gap-3">
              <FiMapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Destinations</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {trip.cities?.length || 0} cities
                </p>
              </div>
            </div>
          </div>
          {trip.totalBudget && (
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4">
              <div className="flex items-center gap-3">
                <FiDollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Budget</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {trip.currency} {trip.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itinerary */}
        {trip.cities && trip.cities.length > 0 ? (
          <div className="space-y-6">
            {trip.cities.map((city, cityIndex) => (
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
                  </div>
                </div>

                {/* Activities */}
                <div className="p-6">
                  {city.activities && city.activities.length > 0 ? (
                    <div className="space-y-4">
                      {city.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
                                  <span>{activity.startTime}</span>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
            <FiMapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No itinerary details
            </h3>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-600 dark:text-slate-400">
          <p>This is a shared itinerary. Get inspired and create your own trip!</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SharedItineraryPage;

