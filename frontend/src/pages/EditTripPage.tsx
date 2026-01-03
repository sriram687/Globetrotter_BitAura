/**
 * Edit Trip Page
 * Edit existing trip details
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiImage, FiTag, FiDollarSign, 
  FiArrowLeft, FiSave, FiUpload 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import { getTrip, updateTrip } from '../services/trip.service';
import type { CreateTripData } from '../services/trip.service';

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  currency: string;
  tags: string[];
  status: string;
}

interface FormErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

const tagOptions = [
  { value: 'leisure', label: 'Leisure', color: 'bg-blue-500' },
  { value: 'adventure', label: 'Adventure', color: 'bg-green-500' },
  { value: 'work', label: 'Work', color: 'bg-purple-500' },
  { value: 'family', label: 'Family', color: 'bg-pink-500' },
  { value: 'romantic', label: 'Romantic', color: 'bg-red-500' },
  { value: 'cultural', label: 'Cultural', color: 'bg-amber-500' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CAD', label: 'CAD (C$)' },
];

const statusOptions = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const suggestedImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
  'https://images.unsplash.com/photo-1539650116574-75c0c6d73aeb?w=400&q=80',
  'https://images.unsplash.com/photo-1502780402662-acc01917809e?w=400&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
];

const EditTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: '',
    currency: 'USD',
    tags: [],
    status: 'PLANNING',
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) {
        toast.error('Trip ID is required');
        navigate('/trips');
        return;
      }

      try {
        setLoading(true);
        const response = await getTrip(id);
        
        if (response.success && response.data) {
          const trip = response.data;
          setFormData({
            name: trip.name,
            description: trip.description || '',
            startDate: trip.startDate.split('T')[0],
            endDate: trip.endDate.split('T')[0],
            coverImage: trip.coverImage || '',
            currency: trip.currency || 'USD',
            tags: trip.tags || [],
            status: trip.status,
          });
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

    fetchTrip();
  }, [id, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleTag = (tag: string) => {
    const updatedTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    handleInputChange('tags', updatedTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tripData: Partial<CreateTripData> & { status?: string } = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverImage: formData.coverImage || undefined,
        currency: formData.currency,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        status: formData.status as any,
      };

      const response = await updateTrip(id, tripData);
      
      if (response.success && response.data) {
        toast.success('Trip updated successfully!');
        navigate(`/trips/${id}`);
      } else {
        throw new Error('Failed to update trip');
      }
    } catch (error: unknown) {
      console.error('Trip update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trip. Please try again.';
      setErrors({ general: errorMessage });
      toast.error('Failed to update trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/trips/${id}`);
    } else {
      navigate('/trips');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading trip...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950"
    >
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-purple-400/10 to-pink-300/5 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/15 via-indigo-300/8 to-transparent blur-3xl" />
      </div>

      <div className="relative w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Trip
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Edit Trip
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Update your trip details
              </p>
            </div>
          </div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Trip Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your trip name..."
                      error={errors.name}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="What makes this trip special? (optional)"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Dates Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Travel Dates
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        error={errors.startDate}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      End Date *
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        error={errors.endDate}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Trip Status
                </h3>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Extras Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Additional Details
                </h3>
                
                <div className="space-y-6">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Cover Image
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <FiImage className="w-4 h-4" />
                        Choose from suggestions or add your own URL
                      </div>
                      
                      {/* Image URL Input */}
                      <div className="relative">
                        <FiUpload className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                          value={formData.coverImage}
                          onChange={(e) => handleInputChange('coverImage', e.target.value)}
                          placeholder="Paste image URL..."
                          className="pl-10"
                        />
                      </div>

                      {/* Suggested Images */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {suggestedImages.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleInputChange('coverImage', image)}
                            className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              formData.coverImage === image
                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <img src={image} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      {/* Preview */}
                      {formData.coverImage && (
                        <div className="mt-3">
                          <img 
                            src={formData.coverImage} 
                            alt="Cover preview" 
                            className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Currency
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {currencyOptions.map(currency => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Trip Tags
                    </label>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <FiTag className="w-3 h-3" />
                      Select all that apply
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagOptions.map(tag => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => toggleTag(tag.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            formData.tags.includes(tag.value)
                              ? `${tag.color} text-white shadow-sm`
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Sticky Action Buttons */}
          <div className="sticky bottom-0 mt-8 pt-4 pb-2 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
                leftIcon={<FiSave />}
                className="sm:order-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditTripPage;

