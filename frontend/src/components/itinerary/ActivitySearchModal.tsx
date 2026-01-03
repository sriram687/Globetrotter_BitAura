/**
 * Activity Search Modal
 * Browse and select activities for a city
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiClock, FiDollarSign, FiX, FiPlus, FiFilter } from 'react-icons/fi';
import { Modal, Input, Button } from '../ui';
import api from '../../services/api';
import type { ApiResponse } from '../../services/api';
import toast from 'react-hot-toast';

interface ActivitySearchModalProps {
  cityId: string;
  onClose: () => void;
  onSelect: (activityData: {
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
  }) => void;
}

interface ActivityTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  destination: string;
  country: string;
  avgCost?: number;
  avgDuration?: number;
  image?: string;
  rating?: number;
  tags: string[];
}

const activityCategories = [
  'SIGHTSEEING',
  'FOOD',
  'ADVENTURE',
  'CULTURE',
  'SHOPPING',
  'NIGHTLIFE',
  'RELAXATION',
  'OTHER',
];

const ActivitySearchModal: React.FC<ActivitySearchModalProps> = ({
  cityId,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activities, setActivities] = useState<ActivityTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityTemplate | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    cost: '0',
    currency: 'USD',
  });

  useEffect(() => {
    // Load activities for the city
    loadActivities();
  }, [cityId, selectedCategory]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Get city info first to get destination name
      const cityResponse = await api.get<ApiResponse<any>>(`/cities/${cityId}`);
      if (cityResponse.data.success && cityResponse.data.data) {
        const city = cityResponse.data.data;
        const params = new URLSearchParams({
          destination: city.name,
          limit: '20',
        });
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        const response = await api.get<ApiResponse<ActivityTemplate[]>>(
          `/activities/templates?${params}`
        );
        if (response.data.success && response.data.data) {
          setActivities(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActivity = (activity: ActivityTemplate) => {
    setSelectedActivity(activity);
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      cost: String(activity.avgCost || 0),
      currency: 'USD',
    });
  };

  const handleAddActivity = () => {
    if (!selectedActivity || !formData.date) {
      toast.error('Please select an activity and date');
      return;
    }

    onSelect({
      name: selectedActivity.name,
      description: selectedActivity.description,
      category: selectedActivity.category,
      location: selectedActivity.destination,
      date: formData.date,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      duration: selectedActivity.avgDuration || undefined,
      cost: parseFloat(formData.cost) || 0,
      currency: formData.currency,
    });
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Activity" size="lg">
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Category:</span>
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            {activityCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Activity Form */}
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {selectedActivity.name}
                </h3>
                {selectedActivity.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedActivity.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cost
                </label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Activities List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : activities.length > 0 ? (
            activities
              .filter((activity) =>
                searchQuery === '' ||
                activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((activity) => (
                <motion.button
                  key={activity.id}
                  onClick={() => handleSelectActivity(activity)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedActivity?.id === activity.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {activity.image ? (
                      <img
                        src={activity.image}
                        alt={activity.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <FiClock className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {activity.name}
                      </h4>
                      {activity.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                          {getCategoryLabel(activity.category)}
                        </span>
                        {activity.avgDuration && (
                          <div className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            <span>{activity.avgDuration} min</span>
                          </div>
                        )}
                        {activity.avgCost && activity.avgCost > 0 && (
                          <div className="flex items-center gap-1">
                            <FiDollarSign className="w-3 h-3" />
                            <span>${activity.avgCost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p>No activities found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddActivity}
            disabled={!selectedActivity || !formData.date}
            leftIcon={<FiPlus />}
          >
            Add Activity
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivitySearchModal;

