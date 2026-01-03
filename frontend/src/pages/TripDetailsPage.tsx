/**
 * Trip Details Page
 * Complete trip information with itinerary, budget, and actions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiMapPin, FiDollarSign, FiShare2,
  FiEdit3, FiTrash2, FiArrowLeft, FiClock, FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button } from '../components/ui';
import { getTrip, deleteTrip, generateShareLink } from '../services/trip.service';
import type { Trip } from '../services/trip.service';
import ShareTripModal from '../components/trip/ShareTripModal';

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const fetchTrip = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getTrip(id);
      
      if (response.success && response.data) {
        setTrip(response.data);
      } else {
        toast.error('Trip not found');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      toast.error('Failed to load trip');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = () => {
    if (!trip) return '';
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = () => {
    if (!trip) return null;
    
    const statusConfig = {
      PLANNING: { color: 'bg-blue-500', text: 'Planning' },
      UPCOMING: { color: 'bg-emerald-500', text: 'Upcoming' },
      ONGOING: { color: 'bg-amber-500', text: 'Ongoing' },
      COMPLETED: { color: 'bg-slate-500', text: 'Completed' },
      CANCELLED: { color: 'bg-red-500', text: 'Cancelled' }
    };

    const config = statusConfig[trip.status] || statusConfig.PLANNING;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleDelete = async () => {
    if (!trip || !confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await deleteTrip(trip.id);
      
      if (response.success) {
        toast.success('Trip deleted successfully');
        navigate('/trips');
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      toast.error('Failed to delete trip');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!trip) return;

    try {
      setSharing(true);
      const response = await generateShareLink(trip.id);
      
      if (response.success && response.data) {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success('Share link copied to clipboard!');
      } else {
        toast.error('Failed to generate share link');
      }
    } catch (error) {
      console.error('Failed to share trip:', error);
      toast.error('Failed to share trip');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Trip Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The trip you're looking for doesn't exist or has been deleted.</p>
          <Link to="/trips">
            <Button>Back to My Trips</Button>
          </Link>
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

      {/* Header */}
      <div className="relative">
        {trip.coverImage && (
          <div className="h-64 md:h-80 relative overflow-hidden">
            <img
              src={trip.coverImage}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Header content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="max-w-7xl mx-auto">
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to My Trips
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge()}
                      <span className="text-white/80 text-sm">{getDuration()}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {trip.name}
                    </h1>
                    {trip.description && (
                      <p className="text-white/90 text-lg max-w-2xl">
                        {trip.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      leftIcon={<FiUsers />}
                    >
                      Share with Friends
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      isLoading={sharing}
                      leftIcon={<FiShare2 />}
                    >
                      Share Link
                    </Button>
                    <Link to={`/trips/${trip.id}/edit`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FiEdit3 />}
                      >
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={deleting}
                      leftIcon={<FiTrash2 />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No cover image header */}
        {!trip.coverImage && (
          <div className="relative bg-white/90 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to My Trips
              </Link>
              
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge()}
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{getDuration()}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {trip.name}
                  </h1>
                  {trip.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                      {trip.description}
                    </p>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    leftIcon={<FiUsers />}
                  >
                    Share with Friends
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    isLoading={sharing}
                    leftIcon={<FiShare2 />}
                  >
                    Share Link
                  </Button>
                  <Link to={`/trips/${trip.id}/edit`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiEdit3 />}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={deleting}
                    leftIcon={<FiTrash2 />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Trip Overview
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Start Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(trip.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">End Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {formatDate(trip.endDate)}
                    </p>
                  </div>
                </div>

                {trip.cities && trip.cities.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FiMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Destinations</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {trip.cities.length} {trip.cities.length === 1 ? 'city' : 'cities'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <FiClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Duration</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {getDuration()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {trip.tags && trip.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Destinations */}
            {trip.cities && trip.cities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Destinations
                </h2>
                
                <div className="space-y-3">
                  {trip.cities.map((city, index) => (
                    <div
                      key={city.id}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {city.name}
                          </h3>
                          {city.country && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {city.country}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDateShort(city.arrivalDate)} - {formatDateShort(city.departureDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link to={`/trips/${trip.id}/view`}>
                  <button className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full">
                    <FiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">View Itinerary</span>
                  </button>
                </Link>
                <Link to={`/trips/${trip.id}/itinerary`}>
                  <button className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full">
                    <FiMapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Build Itinerary</span>
                  </button>
                </Link>
                
                <Link to={`/trips/${trip.id}/budget`}>
                  <button className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full">
                    <FiDollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Budget</span>
                  </button>
                </Link>
                
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full"
                >
                  <FiShare2 className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">Share</span>
                </button>
                
                <Link to={`/trips/${trip.id}/edit`}>
                  <button className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full">
                    <FiEdit3 className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Edit</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Summary */}
            {trip.budget && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Budget Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Budget</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {trip.currency} {trip.budget.totalBudget?.toLocaleString() || 0}
                    </span>
                  </div>
                  
                  {trip.budget.calculated && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Spent</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {trip.currency} {trip.budget.calculated.actualSpent?.toLocaleString() || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Remaining</span>
                        <span className={`font-medium ${trip.budget.calculated.remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {trip.currency} {Math.abs(trip.budget.calculated.remaining)?.toLocaleString() || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <Link to={`/trips/${trip.id}/budget`} className="block mt-4">
                  <Button variant="outline" size="sm" fullWidth>
                    View Full Budget
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Trip Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Trip Statistics
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDateShort(trip.createdAt)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDateShort(trip.updatedAt)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Visibility</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {trip.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Cover Image */}
            {trip.coverImage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Cover Image
                </h3>
                
                <img
                  src={trip.coverImage}
                  alt={trip.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Share Trip Modal */}
      {showShareModal && trip && (
        <ShareTripModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          tripId={trip.id}
          sharedUsers={trip.sharedWith as any}
          onUpdate={fetchTrip}
        />
      )}
    </motion.div>
  );
};

export default TripDetailsPage;