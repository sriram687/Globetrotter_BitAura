/**
 * Explore Page
 * Discover and explore public trips and destinations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiCalendar, FiGlobe, FiTrendingUp,
  FiFilter, FiGrid, FiList
} from 'react-icons/fi';
import { Input, Button } from '../components/ui';
import { getPopularDestinations, searchDestinations } from '../services/trip.service';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import toast from 'react-hot-toast';

interface Destination {
  name: string;
  country: string;
  countryCode?: string;
  image?: string;
  costIndex?: number;
  popularity?: number;
  description?: string;
}

interface PublicTrip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [publicTrips, setPublicTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length === 0) {
      loadData();
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [destRes, tripsRes] = await Promise.all([
        getPopularDestinations(12),
        api.get<ApiResponse<PublicTrip[]>>('/trips/public?limit=12'),
      ]);

      if (destRes.success) {
        setDestinations(destRes.data as Destination[]);
      }

      if (tripsRes.data.success) {
        setPublicTrips(tripsRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const response = await searchDestinations(searchQuery, 12);
      if (response.success) {
        setDestinations(response.data as Destination[]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Explore
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover amazing destinations and get inspired by others' trips
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="w-6 h-6" />
              Popular Destinations
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading destinations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((destination, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden hover:shadow-[0_25px_80px_-15px_rgba(79,70,229,0.4)] transition-all group cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden">
                    {destination.image ? (
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                        <FiGlobe className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-white/80 text-sm">{destination.country}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {destination.costIndex && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < destination.costIndex!
                                ? 'bg-amber-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          Cost Index
                        </span>
                      </div>
                    )}
                    {destination.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {destination.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Public Trips */}
        {publicTrips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="w-6 h-6" />
                Featured Trips
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {publicTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden hover:shadow-[0_25px_80px_-15px_rgba(79,70,229,0.4)] transition-all"
                >
                  {trip.coverImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={trip.coverImage}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      <span>by {trip.user.firstName} {trip.user.lastName}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExplorePage;

