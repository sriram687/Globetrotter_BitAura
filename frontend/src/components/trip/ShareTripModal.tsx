/**
 * Share Trip Modal
 * Share trip with friends by email
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiUser, FiX, FiPlus, FiTrash2, FiEye, FiEdit3 } from 'react-icons/fi';
import { Modal, Input, Button } from '../ui';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ApiResponse } from '../../services/api';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  sharedUsers?: Array<{
    id: string;
    userId: string;
    permission: 'VIEW' | 'EDIT';
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  }>;
  onUpdate: () => void;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  tripId,
  sharedUsers = [],
  onUpdate,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<ApiResponse<any>>(
        `/trips/${tripId}/share-with-user`,
        { email, permission }
      );

      if (response.data.success) {
        toast.success(`Trip shared with ${email}`);
        setEmail('');
        onUpdate();
      }
    } catch (error: any) {
      console.error('Failed to share trip:', error);
      const message = error.response?.data?.message || 'Failed to share trip';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (userId: string) => {
    try {
      setRemoving(userId);
      const response = await api.delete<ApiResponse<any>>(
        `/trips/${tripId}/share-with-user/${userId}`
      );

      if (response.data.success) {
        toast.success('Access removed');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to remove access:', error);
      toast.error('Failed to remove access');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Trip with Friends" size="lg">
      <div className="space-y-6">
        {/* Add Friend Section */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Invite by Email
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Friend's Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                leftIcon={<FiMail />}
                onKeyPress={(e) => e.key === 'Enter' && handleShare()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Permission
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'VIEW' | 'EDIT')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="VIEW">View Only</option>
                <option value="EDIT">Can Edit</option>
              </select>
            </div>
            <Button
              onClick={handleShare}
              isLoading={loading}
              leftIcon={<FiPlus />}
              fullWidth
            >
              Share Trip
            </Button>
          </div>
        </div>

        {/* Shared Users List */}
        {sharedUsers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Shared With ({sharedUsers.length})
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {sharedUsers.map((shared) => (
                  <motion.div
                    key={shared.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        {shared.user.avatar ? (
                          <img
                            src={shared.user.avatar}
                            alt={shared.user.firstName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {shared.user.firstName} {shared.user.lastName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {shared.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        shared.permission === 'EDIT'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {shared.permission === 'EDIT' ? (
                          <span className="flex items-center gap-1">
                            <FiEdit3 className="w-3 h-3" />
                            Can Edit
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FiEye className="w-3 h-3" />
                            View Only
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleRemoveAccess(shared.userId)}
                        disabled={removing === shared.userId}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {sharedUsers.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FiUser className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No one has access yet. Invite friends to collaborate!</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ShareTripModal;

