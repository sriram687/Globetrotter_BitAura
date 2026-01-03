/**
 * Trip Budget & Cost Breakdown Page
 * Financial view showing estimated total cost and breakdowns
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiDollarSign, FiArrowLeft, FiPieChart, FiBarChart2,
  FiAlertCircle, FiTrendingUp, FiTrendingDown, FiEdit3, FiPlus
} from 'react-icons/fi';
import { getTrip, getTripBudget, createBudget, updateBudget } from '../services/trip.service';
import type { Trip, Budget } from '../services/trip.service';
import toast from 'react-hot-toast';
import { Button, Modal, Input } from '../components/ui';

const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: '',
    currency: 'USD',
    accommodation: '',
    transportation: '',
    food: '',
    activities: '',
    shopping: '',
    emergency: '',
    other: '',
  });

  useEffect(() => {
    if (!id) {
      navigate('/trips');
      return;
    }

    fetchData();
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripResponse, budgetResponse] = await Promise.all([
        getTrip(id!),
        getTripBudget(id!)
      ]);

      if (tripResponse.success && tripResponse.data) {
        setTrip(tripResponse.data);
      }

      if (budgetResponse.success && budgetResponse.data) {
        setBudget(budgetResponse.data);
        if (budgetResponse.data) {
          setBudgetForm({
            totalBudget: String(budgetResponse.data.totalBudget || ''),
            currency: budgetResponse.data.currency || 'USD',
            accommodation: String(budgetResponse.data.accommodation || ''),
            transportation: String(budgetResponse.data.transportation || ''),
            food: String(budgetResponse.data.food || ''),
            activities: String(budgetResponse.data.activities || ''),
            shopping: String(budgetResponse.data.shopping || ''),
            emergency: String(budgetResponse.data.emergency || ''),
            other: String(budgetResponse.data.other || ''),
          });
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    if (!trip || !budgetForm.totalBudget) {
      toast.error('Total budget is required');
      return;
    }

    try {
      setSaving(true);
      if (budget) {
        // Update existing budget
        const response = await updateBudget(budget.id, {
          totalBudget: parseFloat(budgetForm.totalBudget),
          currency: budgetForm.currency,
          accommodation: parseFloat(budgetForm.accommodation) || 0,
          transportation: parseFloat(budgetForm.transportation) || 0,
          food: parseFloat(budgetForm.food) || 0,
          activities: parseFloat(budgetForm.activities) || 0,
          shopping: parseFloat(budgetForm.shopping) || 0,
          emergency: parseFloat(budgetForm.emergency) || 0,
          other: parseFloat(budgetForm.other) || 0,
        });
        if (response.success) {
          toast.success('Budget updated successfully');
          setShowBudgetModal(false);
          fetchData();
        }
      } else {
        // Create new budget
        const response = await createBudget({
          tripId: trip.id,
          totalBudget: parseFloat(budgetForm.totalBudget),
          currency: budgetForm.currency,
          accommodation: parseFloat(budgetForm.accommodation) || 0,
          transportation: parseFloat(budgetForm.transportation) || 0,
          food: parseFloat(budgetForm.food) || 0,
          activities: parseFloat(budgetForm.activities) || 0,
          shopping: parseFloat(budgetForm.shopping) || 0,
          emergency: parseFloat(budgetForm.emergency) || 0,
          other: parseFloat(budgetForm.other) || 0,
        });
        if (response.success) {
          toast.success('Budget created successfully');
          setShowBudgetModal(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
      toast.error('Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const calculateBreakdown = () => {
    if (!budget) return null;

    const total = budget.totalBudget;
    const categories = [
      { name: 'Accommodation', value: budget.accommodation, color: 'bg-blue-500' },
      { name: 'Transportation', value: budget.transportation, color: 'bg-green-500' },
      { name: 'Food', value: budget.food, color: 'bg-amber-500' },
      { name: 'Activities', value: budget.activities, color: 'bg-purple-500' },
      { name: 'Shopping', value: budget.shopping, color: 'bg-pink-500' },
      { name: 'Emergency', value: budget.emergency, color: 'bg-red-500' },
      { name: 'Other', value: budget.other, color: 'bg-slate-500' },
    ];

    return {
      total,
      categories: categories.filter(c => c.value > 0),
      currency: budget.currency,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading budget...</p>
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
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Back to My Trips</button>
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = calculateBreakdown();
  const calculated = budget?.calculated;
  const isOverBudget = calculated?.isOverBudget || false;
  const percentUsed = calculated?.percentUsed || 0;

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to={`/trips/${trip.id}`}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Trip
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Budget & Cost Breakdown
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {trip.name}
            </p>
          </div>
          <Button
            onClick={() => setShowBudgetModal(true)}
            leftIcon={budget ? <FiEdit3 /> : <FiPlus />}
          >
            {budget ? 'Edit Budget' : 'Create Budget'}
          </Button>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Budget</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {budget?.currency || trip.currency} {budget?.totalBudget?.toLocaleString() || trip.totalBudget?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </motion.div>

          {calculated && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <FiTrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Spent</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {budget?.currency || trip.currency} {calculated.actualSpent?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 ${
                  isOverBudget
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    isOverBudget
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    {isOverBudget ? (
                      <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    ) : (
                      <FiTrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Remaining</p>
                    <p className={`text-2xl font-bold ${
                      isOverBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {budget?.currency || trip.currency} {Math.abs(calculated.remaining || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Budget Progress */}
        {calculated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Budget Usage
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className={`font-medium ${
                  isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {percentUsed.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOverBudget ? 'bg-red-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              {isOverBudget && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  You are over budget
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Cost Breakdown */}
        {breakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Cost Breakdown
            </h2>
            <div className="space-y-4">
              {breakdown.categories.map((category, index) => {
                const percentage = (category.value / breakdown.total) * 100;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{category.name}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {breakdown.currency} {category.value.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${category.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {!budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 text-center"
          >
            <FiPieChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Budget Set
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create a budget to track your trip expenses
            </p>
            <Button onClick={() => setShowBudgetModal(true)} leftIcon={<FiPlus />}>
              Create Budget
            </Button>
          </motion.div>
        )}

        {/* Budget Modal */}
        {showBudgetModal && (
          <Modal
            isOpen={showBudgetModal}
            onClose={() => setShowBudgetModal(false)}
            title={budget ? 'Edit Budget' : 'Create Budget'}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Total Budget *
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.totalBudget}
                    onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={budgetForm.currency}
                    onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Accommodation
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.accommodation}
                    onChange={(e) => setBudgetForm({ ...budgetForm, accommodation: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Transportation
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.transportation}
                    onChange={(e) => setBudgetForm({ ...budgetForm, transportation: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Food
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.food}
                    onChange={(e) => setBudgetForm({ ...budgetForm, food: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Activities
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.activities}
                    onChange={(e) => setBudgetForm({ ...budgetForm, activities: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Shopping
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.shopping}
                    onChange={(e) => setBudgetForm({ ...budgetForm, shopping: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Emergency
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.emergency}
                    onChange={(e) => setBudgetForm({ ...budgetForm, emergency: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Other
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.other}
                    onChange={(e) => setBudgetForm({ ...budgetForm, other: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="ghost" onClick={() => setShowBudgetModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveBudget} isLoading={saving}>
                  {budget ? 'Update Budget' : 'Create Budget'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </motion.div>
  );
};

export default BudgetPage;

