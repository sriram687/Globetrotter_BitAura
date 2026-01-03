/**
 * Itinerary Builder Page
 * Interface to add cities, dates, and activities for each stop
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus, FiMapPin, FiCalendar, FiEdit3, FiTrash2,
  FiArrowUp, FiArrowDown, FiClock, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Input, Modal } from '../components/ui';
import { getTrip, addCity, updateCity, deleteCity, reorderCities, addActivity } from '../services/trip.service';
import type { Trip, City, ActivityCategory } from '../services/trip.service';
import { CitySearchModal } from '../components/itinerary';
import { ActivitySearchModal } from '../components/itinerary';

const ItineraryBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

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

  const handleAddCity = async (cityData: Partial<City> & { tripId: string }) => {
    try {
      const response = await addCity(cityData);
      if (response.success) {
        toast.success('City added successfully');
        setShowCityModal(false);
        fetchTrip();
      }
    } catch (error) {
      console.error('Failed to add city:', error);
      toast.error('Failed to add city');
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm('Are you sure you want to remove this city? All activities will be deleted.')) {
      return;
    }

    try {
      const response = await deleteCity(cityId);
      if (response.success) {
        toast.success('City removed');
        fetchTrip();
      }
    } catch (error) {
      console.error('Failed to delete city:', error);
      toast.error('Failed to remove city');
    }
  };

  const handleMoveCity = async (cityId: string, direction: 'up' | 'down') => {
    if (!trip?.cities) return;

    const cities = [...trip.cities];
    const index = cities.findIndex(c => c.id === cityId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cities.length) return;

    [cities[index], cities[newIndex]] = [cities[newIndex], cities[index]];

    const cityOrders = cities.map((city, idx) => ({
      id: city.id,
      order: idx
    }));

    try {
      const response = await reorderCities(trip.id, cityOrders);
      if (response.success) {
        fetchTrip();
      }
    } catch (error) {
      console.error('Failed to reorder cities:', error);
      toast.error('Failed to reorder cities');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Trip Not Found</h1>
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to={`/trips/${trip.id}`}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              ← Back to Trip
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Itinerary Builder
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Build your trip by adding cities and activities
            </p>
          </div>
          <Button
            onClick={() => setShowCityModal(true)}
            leftIcon={<FiPlus />}
          >
            Add Stop
          </Button>
        </div>

        {/* Cities List */}
        {trip.cities && trip.cities.length > 0 ? (
          <div className="space-y-6">
            {trip.cities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] overflow-hidden"
              >
                {/* City Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {city.name}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {city.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>{formatDate(city.arrivalDate)} - {formatDate(city.departureDate)}</span>
                        </div>
                        {city.accommodation && (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            <span>{city.accommodation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveCity(city.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
                      >
                        <FiArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveCity(city.id, 'down')}
                        disabled={index === trip.cities!.length - 1}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
                      >
                        <FiArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCity(city)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCity(city.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Activities ({city.activities?.length || 0})
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowActivityModal(city.id)}
                      leftIcon={<FiPlus />}
                    >
                      Add Activity
                    </Button>
                  </div>

                  {city.activities && city.activities.length > 0 ? (
                    <div className="space-y-3">
                      {city.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900 dark:text-white">
                              {activity.name}
                            </h5>
                            {activity.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
                      <p>No activities yet. Add your first activity!</p>
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
              No stops yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start building your itinerary by adding your first destination
            </p>
            <Button onClick={() => setShowCityModal(true)} leftIcon={<FiPlus />}>
              Add Your First Stop
            </Button>
          </div>
        )}
      </div>

      {/* City Search Modal */}
      {showCityModal && trip && (
        <CitySearchModal
          tripId={trip.id}
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
          onClose={() => setShowCityModal(false)}
          onSelect={(cityData) => {
            handleAddCity({
              ...cityData,
              tripId: trip.id
            });
          }}
        />
      )}

      {/* Activity Search Modal */}
      {showActivityModal && (
        <ActivitySearchModal
          cityId={showActivityModal}
          onClose={() => setShowActivityModal(null)}
          onSelect={async (activityData: {
            name: string;
            description?: string;
            category: string;
            location?: string;
            date: string;
            startTime?: string;
            endTime?: string;
            duration?: number;
            cost: number;
            currency: string;
          }) => {
            try {
              const response = await addActivity({ 
                ...activityData, 
                category: activityData.category as ActivityCategory,
                cityId: showActivityModal 
              });
              if (response.success) {
                toast.success('Activity added');
                setShowActivityModal(null);
                fetchTrip();
              }
            } catch (error) {
              console.error('Failed to add activity:', error);
              toast.error('Failed to add activity');
            }
          }}
        />
      )}

      {/* Edit City Modal */}
      {editingCity && (
        <EditCityModal
          city={editingCity}
          onClose={() => setEditingCity(null)}
          onSave={async (data) => {
            try {
              const response = await updateCity(editingCity.id, data);
              if (response.success) {
                toast.success('City updated');
                setEditingCity(null);
                fetchTrip();
              }
            } catch (error) {
              console.error('Failed to update city:', error);
              toast.error('Failed to update city');
            }
          }}
        />
      )}
    </motion.div>
  );
};

// Edit City Modal Component
const EditCityModal: React.FC<{
  city: City;
  onClose: () => void;
  onSave: (data: Partial<City>) => void;
}> = ({ city, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    arrivalDate: city.arrivalDate.split('T')[0],
    departureDate: city.departureDate.split('T')[0],
    accommodation: city.accommodation || '',
    notes: city.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Edit ${city.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Arrival Date
          </label>
          <Input
            type="date"
            value={formData.arrivalDate}
            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Departure Date
          </label>
          <Input
            type="date"
            value={formData.departureDate}
            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Accommodation
          </label>
          <Input
            value={formData.accommodation}
            onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
            placeholder="Hotel name or address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            rows={3}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ItineraryBuilderPage;

