/**
 * User Profile / Settings Page
 * User settings page to update profile information and preferences
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiTrash2,
  FiCamera, FiGlobe, FiLock, FiBell
} from 'react-icons/fi';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import api from '../services/api';
import type { ApiResponse } from '../services/api';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  bio?: string;
  avatar?: string;
}

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        country: (user as any).country || '',
        bio: (user as any).bio || '',
        avatar: (user as any).avatar || '',
      });
    }
    setLoading(false);
  }, [user]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put<ApiResponse<UserProfile>>('/users/profile', formData);
      if (response.data.success && response.data.data) {
        setUser({ ...user!, ...response.data.data });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete<ApiResponse<{ message: string }>>('/users/account');
      if (response.data.success) {
        toast.success('Account deleted');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Profile & Settings
        </h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Profile Information
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                  <FiCamera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{formData.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Name
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  leftIcon={<FiUser />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Name
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  leftIcon={<FiUser />}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  leftIcon={<FiMail />}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  leftIcon={<FiPhone />}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  leftIcon={<FiMapPin />}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} isLoading={saving} leftIcon={<FiSave />}>
                Save Changes
              </Button>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Language</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">English</p>
                  </div>
                </div>
                <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiBell className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Notifications</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Email notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-red-200 dark:border-red-800 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 md:p-8"
          >
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Delete Account</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                leftIcon={<FiTrash2 />}
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

