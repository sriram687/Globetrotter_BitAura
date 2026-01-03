/**
 * My Trips Page
 * List all user trips with filters and search
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiCalendar, FiMapPin,
  FiDollarSign, FiEdit3, FiTrash2, FiEye,
  FiGrid, FiList, FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import { getUserTrips, deleteTrip } from '../services/trip.service';
import type { Trip } from '../services/trip.service';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'planning' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
type SortBy = 'newest' | 'oldest' | 'startDate' | 'name';

const MyTripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [deletingTrip, setDeletingTrip] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await getUserTrips();
        
        if (response.success && response.data) {
          setTrips(response.data);
        }
      } catch (error) {
        console.error('Failed to load trips:', error);
        toast.error('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = (status: Trip['status']) => {
    const statusConfig = {
      PLANNING: { color: 'bg-blue-500 text-white', text: 'Planning' },
      UPCOMING: { color: 'bg-emerald-500 text-white', text: 'Upcoming' },
      ONGOING: { color: 'bg-amber-500 text-white', text: 'Ongoing' },
      COMPLETED: { color: 'bg-slate-500 text-white', text: 'Completed' },
      CANCELLED: { color: 'bg-red-500 text-white', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PLANNING;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredAndSortedTrips = React.useMemo(() => {
    const filtered = trips.filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trip.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || trip.status.toLowerCase() === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort trips
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trips, searchQuery, filterStatus, sortBy]);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingTrip(tripId);
      const response = await deleteTrip(tripId);
      
      if (response.success) {
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
        toast.success('Trip deleted successfully');
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast.error('Failed to delete trip');
    } finally {
      setDeletingTrip(null);
    }
  };

  const TripCard = ({ trip, index }: { trip: Trip; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden hover:shadow-[0_25px_80px_-15px_rgba(79,70,229,0.4)] transition-all group"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(trip.status)}
          {trip.isShared && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
              Shared
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/trips/${trip.id}`}>
            <button className="p-2 bg-white/90 text-slate-700 rounded-lg hover:bg-white transition-colors">
              <FiEye className="w-4 h-4" />
            </button>
          </Link>
          <Link to={`/trips/${trip.id}/edit`}>
            <button className="p-2 bg-white/90 text-slate-700 rounded-lg hover:bg-white transition-colors">
              <FiEdit3 className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        {trip.description && (
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
            {trip.description}
          </p>
        )}

        {/* Trip details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <FiMapPin className="w-4 h-4" />
              <span>{trip._count?.cities || 0} destinations</span>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              {getDuration(trip.startDate, trip.endDate)}
            </span>
          </div>

          {trip.totalBudget && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <FiDollarSign className="w-4 h-4" />
              <span>{trip.currency} {trip.totalBudget.toLocaleString()} budget</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trip.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {trip.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                +{trip.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
          <Link to={`/trips/${trip.id}`}>
            <Button variant="ghost" size="sm">
              View Details
              <FiArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTrip(trip.id);
            }}
            disabled={deletingTrip === trip.id}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const TripListItem = ({ trip, index }: { trip: Trip; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-4 hover:shadow-[0_25px_80px_-15px_rgba(79,70,229,0.4)] transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Cover image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80'}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg truncate">
                  {trip.name}
                </h3>
                {getStatusBadge(trip.status)}
                {trip.isShared && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                    Shared
                  </span>
                )}
              </div>
              {trip.isShared && trip.sharedBy && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Shared by {trip.sharedBy.firstName} {trip.sharedBy.lastName}
                </p>
              )}
              
              {trip.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-1 mb-2">
                  {trip.description}
                </p>
              )}
              {trip.isShared && trip.sharedBy && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Shared by {trip.sharedBy.firstName} {trip.sharedBy.lastName}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  <span>{trip._count?.cities || 0} destinations</span>
                </div>
                {trip.totalBudget && (
                  <div className="flex items-center gap-1">
                    <FiDollarSign className="w-4 h-4" />
                    <span>{trip.currency} {trip.totalBudget.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-4">
              <Link to={`/trips/${trip.id}`}>
                <Button variant="ghost" size="sm">
                  <FiEye className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={`/trips/${trip.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <FiEdit3 className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTrip(trip.id)}
                disabled={deletingTrip === trip.id}
              >
                <FiTrash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              My Trips
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and explore all your travel adventures
            </p>
          </div>
          
          <Link to="/trips/new">
            <Button leftIcon={<FiPlus />}>
              Create New Trip
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trips..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters and controls */}
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="startDate">Start Date</option>
                <option value="name">Name</option>
              </select>

              {/* View mode */}
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'} transition-colors`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'} transition-colors`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            {loading ? 'Loading...' : `${filteredAndSortedTrips.length} trip${filteredAndSortedTrips.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading your trips...</p>
          </div>
        ) : filteredAndSortedTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No trips match your filters' : 'No trips yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start planning your next adventure and create your first trip'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link to="/trips/new">
                <Button leftIcon={<FiPlus />}>
                  Create Your First Trip
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredAndSortedTrips.map((trip, index) => 
                viewMode === 'grid' ? (
                  <TripCard key={trip.id} trip={trip} index={index} />
                ) : (
                  <TripListItem key={trip.id} trip={trip} index={index} />
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyTripsPage;