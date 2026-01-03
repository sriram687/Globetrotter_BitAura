/**
 * City Search Modal
 * Search and add cities to a trip
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiX, FiPlus } from 'react-icons/fi';
import { Modal, Input, Button } from '../ui';
import { searchDestinations, getPopularDestinations } from '../../services/trip.service';
import toast from 'react-hot-toast';

interface CitySearchModalProps {
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  onClose: () => void;
  onSelect: (cityData: {
    name: string;
    country: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    image?: string;
    arrivalDate: string;
    departureDate: string;
  }) => void;
}

interface Destination {
  name: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  costIndex?: number;
  popularity?: number;
}

const CitySearchModal: React.FC<CitySearchModalProps> = ({
  tripId,
  tripStartDate,
  tripEndDate,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<Destination | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  useEffect(() => {
    loadPopularDestinations();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchCities();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.length === 0) {
      loadPopularDestinations();
    }
  }, [searchQuery]);

  const loadPopularDestinations = async () => {
    try {
      setLoading(true);
      const response = await getPopularDestinations(20);
      if (response.success && response.data) {
        setDestinations(response.data as Destination[]);
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async () => {
    try {
      setLoading(true);
      const response = await searchDestinations(searchQuery, 20);
      if (response.success && response.data) {
        setDestinations(response.data as Destination[]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (destination: Destination) => {
    setSelectedCity(destination);
  };

  const handleAddToTrip = () => {
    if (!selectedCity || !arrivalDate || !departureDate) {
      toast.error('Please select a city and dates');
      return;
    }

    if (new Date(arrivalDate) < new Date(tripStartDate) || new Date(departureDate) > new Date(tripEndDate)) {
      toast.error('Dates must be within trip dates');
      return;
    }

    onSelect({
      name: selectedCity.name,
      country: selectedCity.country,
      countryCode: selectedCity.countryCode,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      image: selectedCity.image,
      arrivalDate,
      departureDate,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add City to Trip" size="lg">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cities..."
            className="pl-10"
          />
        </div>

        {/* Selected City Info */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {selectedCity.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedCity.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedCity(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Arrival Date
                </label>
                <Input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  min={tripStartDate.split('T')[0]}
                  max={tripEndDate.split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Departure Date
                </label>
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={arrivalDate || tripStartDate.split('T')[0]}
                  max={tripEndDate.split('T')[0]}
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Destinations List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : destinations.length > 0 ? (
            destinations.map((destination) => (
              <motion.button
                key={`${destination.name}-${destination.country}`}
                onClick={() => handleSelectCity(destination)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedCity?.name === destination.name && selectedCity?.country === destination.country
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <FiMapPin className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {destination.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {destination.country}
                    </p>
                    {destination.costIndex && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < destination.costIndex!
                                ? 'bg-amber-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">
                          Cost Index
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No destinations found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToTrip}
            disabled={!selectedCity || !arrivalDate || !departureDate}
            leftIcon={<FiPlus />}
          >
            Add to Trip
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CitySearchModal;

