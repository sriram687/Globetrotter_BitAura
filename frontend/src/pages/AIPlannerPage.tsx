/**
 * AI Planner Page
 * AI-powered trip planning assistant
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSparkles, FiSend, FiMapPin, FiCalendar, FiDollarSign,
  FiTrendingUp, FiActivity, FiUtensils, FiLightbulb
} from 'react-icons/fi';
import { Button, Input } from '../components/ui';
import { getTripSuggestions, chatWithAI, getBudgetRecommendations } from '../services/ai.service';
import type { TripSuggestion, BudgetRecommendation } from '../services/ai.service';
import toast from 'react-hot-toast';

const AIPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat' | 'budget'>('suggestions');
  
  // Trip suggestions form
  const [suggestionForm, setSuggestionForm] = useState({
    destination: '',
    duration: '',
    budget: '',
    interests: [] as string[],
    travelStyle: 'moderate',
  });
  const [suggestions, setSuggestions] = useState<TripSuggestion | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  // Budget recommendations
  const [budgetForm, setBudgetForm] = useState({
    destination: '',
    duration: '',
    travelStyle: 'moderate',
  });
  const [budgetRecs, setBudgetRecs] = useState<BudgetRecommendation | null>(null);

  const interestOptions = ['Culture', 'Adventure', 'Food', 'Nature', 'History', 'Nightlife', 'Shopping', 'Relaxation'];

  const handleGetSuggestions = async () => {
    if (!suggestionForm.destination || !suggestionForm.duration) {
      toast.error('Please fill in destination and duration');
      return;
    }

    try {
      setLoading(true);
      const response = await getTripSuggestions({
        destination: suggestionForm.destination,
        duration: parseInt(suggestionForm.duration),
        budget: suggestionForm.budget ? parseFloat(suggestionForm.budget) : undefined,
        interests: suggestionForm.interests,
        travelStyle: suggestionForm.travelStyle,
      });

      if (response.success && response.data) {
        setSuggestions(response.data);
        toast.success('Trip suggestions generated!');
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);

    try {
      const response = await chatWithAI(userMessage);
      if (response.success && response.data) {
        setChatMessages(prev => [...prev, { role: 'ai', message: response.data!.message }]);
      }
    } catch (error) {
      console.error('Chat failed:', error);
      toast.error('Failed to get AI response');
    }
  };

  const handleGetBudgetRecs = async () => {
    if (!budgetForm.destination || !budgetForm.duration) {
      toast.error('Please fill in destination and duration');
      return;
    }

    try {
      setLoading(true);
      const response = await getBudgetRecommendations({
        destination: budgetForm.destination,
        duration: parseInt(budgetForm.duration),
        travelStyle: budgetForm.travelStyle,
      });

      if (response.success && response.data) {
        setBudgetRecs(response.data);
        toast.success('Budget recommendations generated!');
      }
    } catch (error) {
      console.error('Failed to get budget recommendations:', error);
      toast.error('Failed to generate budget recommendations');
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <FiSparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              AI Travel Planner
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Get personalized trip suggestions powered by AI
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'suggestions', label: 'Trip Suggestions', icon: FiMapPin },
            { id: 'chat', label: 'Chat Assistant', icon: FiSend },
            { id: 'budget', label: 'Budget Planner', icon: FiDollarSign },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trip Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Plan Your Trip
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Destination *
                  </label>
                  <Input
                    value={suggestionForm.destination}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, destination: e.target.value })}
                    placeholder="e.g., Paris, Tokyo, New York"
                    leftIcon={<FiMapPin />}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Duration (days) *
                    </label>
                    <Input
                      type="number"
                      value={suggestionForm.duration}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, duration: e.target.value })}
                      placeholder="7"
                      leftIcon={<FiCalendar />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Budget (optional)
                    </label>
                    <Input
                      type="number"
                      value={suggestionForm.budget}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, budget: e.target.value })}
                      placeholder="5000"
                      leftIcon={<FiDollarSign />}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Travel Style
                  </label>
                  <select
                    value={suggestionForm.travelStyle}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, travelStyle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="budget">Budget</option>
                    <option value="moderate">Moderate</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        onClick={() => {
                          const interests = suggestionForm.interests.includes(interest)
                            ? suggestionForm.interests.filter(i => i !== interest)
                            : [...suggestionForm.interests, interest];
                          setSuggestionForm({ ...suggestionForm, interests });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          suggestionForm.interests.includes(interest)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleGetSuggestions}
                  isLoading={loading}
                  fullWidth
                  leftIcon={<FiSparkles />}
                >
                  Generate Suggestions
                </Button>
              </div>
            </motion.div>

            {/* Suggestions Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 overflow-y-auto max-h-[calc(100vh-200px)]"
            >
              {suggestions ? (
                <div className="space-y-6">
                  {suggestions.bestTimeToVisit && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Best Time to Visit
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{suggestions.bestTimeToVisit}</p>
                    </div>
                  )}
                  {suggestions.attractions && suggestions.attractions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        Top Attractions
                      </h3>
                      <div className="space-y-2">
                        {suggestions.attractions.map((attraction, index) => (
                          <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="font-medium text-slate-900 dark:text-white">{attraction.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{attraction.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.tips && suggestions.tips.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiLightbulb className="w-4 h-4" />
                        Tips
                      </h3>
                      <ul className="space-y-1">
                        {suggestions.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestions.rawSuggestion && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {suggestions.rawSuggestion}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <FiSparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Fill in the form and generate AI-powered trip suggestions</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 h-[600px] flex flex-col"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Chat with AI Assistant
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <FiSparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI travel assistant</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask me anything about travel..."
                className="flex-1"
              />
              <Button onClick={handleSendChat} leftIcon={<FiSend />}>
                Send
              </Button>
            </div>
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Budget Planner
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Destination *
                  </label>
                  <Input
                    value={budgetForm.destination}
                    onChange={(e) => setBudgetForm({ ...budgetForm, destination: e.target.value })}
                    placeholder="e.g., Paris, Tokyo"
                    leftIcon={<FiMapPin />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (days) *
                  </label>
                  <Input
                    type="number"
                    value={budgetForm.duration}
                    onChange={(e) => setBudgetForm({ ...budgetForm, duration: e.target.value })}
                    placeholder="7"
                    leftIcon={<FiCalendar />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Travel Style
                  </label>
                  <select
                    value={budgetForm.travelStyle}
                    onChange={(e) => setBudgetForm({ ...budgetForm, travelStyle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="budget">Budget</option>
                    <option value="moderate">Moderate</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <Button
                  onClick={handleGetBudgetRecs}
                  isLoading={loading}
                  fullWidth
                  leftIcon={<FiDollarSign />}
                >
                  Get Budget Recommendations
                </Button>
              </div>
            </motion.div>

            {/* Budget Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.3)] p-6 overflow-y-auto max-h-[calc(100vh-200px)]"
            >
              {budgetRecs ? (
                <div className="space-y-6">
                  {budgetRecs.dailyBudget && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Daily Budget Breakdown
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(budgetRecs.dailyBudget).map(([category, ranges]) => (
                          <div key={category} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="font-medium text-slate-900 dark:text-white mb-2 capitalize">{category}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600 dark:text-green-400">Low: ${(ranges as any).low}</span>
                              <span className="text-amber-600 dark:text-amber-400">Mid: ${(ranges as any).mid}</span>
                              <span className="text-red-600 dark:text-red-400">High: ${(ranges as any).high}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {budgetRecs.totalEstimate && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                        Total Estimate
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-slate-600 dark:text-slate-400">Budget</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ${budgetRecs.totalEstimate.low}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <span className="text-slate-600 dark:text-slate-400">Moderate</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            ${budgetRecs.totalEstimate.mid}
                          </span>
                        </div>
                        <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-slate-600 dark:text-slate-400">Luxury</span>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            ${budgetRecs.totalEstimate.high}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {budgetRecs.savingTips && budgetRecs.savingTips.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <FiLightbulb className="w-4 h-4" />
                        Saving Tips
                      </h3>
                      <ul className="space-y-1">
                        {budgetRecs.savingTips.map((tip, index) => (
                          <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <FiDollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Get AI-powered budget recommendations for your trip</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIPlannerPage;

