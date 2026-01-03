/**
 * Dashboard Page
 * Main dashboard with trip overview, stats, and quick actions
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiGlobe,
  FiUsers,
  FiStar,
  FiChevronRight,
  FiSun,
  FiCloud,
} from 'react-icons/fi';
import { Card, Button, Loading } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import * as tripService from '../services/trip.service';

interface Trip {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  status: string;
  cities: { id: string; name: string }[];
}

interface Stats {
  totalTrips: number;
  citiesVisited: number;
  countriesVisited: number;
  totalBudget: number;
}

const popularDestinations = [
  { id: '1', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', rating: 4.8 },
  { id: '2', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', rating: 4.9 },
  { id: '3', name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', rating: 4.7 },
  { id: '4', name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', rating: 4.6 },
];

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalTrips: 0,
    citiesVisited: 0,
    countriesVisited: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await tripService.getTrips();
        if (response.success && response.data) {
          setTrips(response.data);
          // Calculate stats
          const totalBudget = response.data.reduce((acc: number, trip: Trip) => {
            return acc + (trip as any).budget?.total || 0;
          }, 0);
          const citiesCount = response.data.reduce((acc: number, trip: Trip) => {
            return acc + (trip.cities?.length || 0);
          }, 0);
          setStats({
            totalTrips: response.data.length,
            citiesVisited: citiesCount,
            countriesVisited: Math.floor(citiesCount / 2), // Rough estimate
            totalBudget,
          });
        }
      } catch (_error) {
        // Handle silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingTrips = trips
    .filter((trip) => new Date(trip.startDate) > new Date())
    .slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {user?.firstName || 'Traveler'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Ready to plan your next adventure?
          </p>
        </div>
        <Button onClick={() => navigate('/trips/new')} leftIcon={<FiPlus className="w-5 h-5" />}>
          Create New Trip
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FiGlobe, label: 'Total Trips', value: stats.totalTrips, color: 'indigo' },
          { icon: FiMapPin, label: 'Cities Visited', value: stats.citiesVisited, color: 'emerald' },
          { icon: FiUsers, label: 'Countries', value: stats.countriesVisited, color: 'purple' },
          { icon: FiDollarSign, label: 'Total Budget', value: `$${stats.totalBudget.toLocaleString()}`, color: 'amber' },
        ].map((stat) => (
          <Card key={stat.label} glass className="p-4 md:p-6">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Trips */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Upcoming Trips
            </h2>
            <Link
              to="/trips"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
            >
              View all <FiChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingTrips.length > 0 ? (
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <Card
                  key={trip.id}
                  hoverable
                  className="p-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-32 sm:h-auto">
                      <img
                        src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {trip.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <FiMapPin className="w-4 h-4" />
                            {trip.cities.map((c) => c.name).join(', ') || 'No cities added'}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trip.status === 'PLANNING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          trip.status === 'BOOKED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {trip.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {formatDate(trip.startDate)}
                        </span>
                        <span>→</span>
                        <span>{formatDate(trip.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                No upcoming trips
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Start planning your next adventure today!
              </p>
              <Button onClick={() => navigate('/trips/new')}>
                Create Your First Trip
              </Button>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions & Weather */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { icon: FiPlus, label: 'New Trip', path: '/trips/new' },
                { icon: FiMapPin, label: 'Explore Places', path: '/explore' },
                { icon: FiCalendar, label: 'View Calendar', path: '/calendar' },
                { icon: FiDollarSign, label: 'Budget Overview', path: '/budget' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Weather Widget (Placeholder) */}
          <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Current Location</p>
                <h3 className="font-semibold text-xl mt-1">San Francisco</h3>
              </div>
              <FiSun className="w-10 h-10 text-yellow-300" />
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold">72°F</span>
              <p className="text-indigo-100 mt-1">Sunny, feels like 74°F</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Popular Destinations */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Popular Destinations
          </h2>
          <Link
            to="/explore"
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
          >
            Explore all <FiChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularDestinations.map((dest) => (
            <Card
              key={dest.id}
              hoverable
              className="p-0 overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/explore?destination=${dest.name}`)}
            >
              <div className="relative h-40">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-semibold text-white">{dest.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-white/80">{dest.country}</span>
                    <span className="flex items-center gap-1 text-sm text-white">
                      <FiStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {dest.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* AI Trip Planner CTA */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 md:p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                ✨ Let AI Plan Your Perfect Trip
              </h2>
              <p className="text-white/80">
                Get personalized itineraries, restaurant recommendations, and hidden gems powered by AI.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/ai-planner')}
              className="whitespace-nowrap bg-white text-indigo-600 hover:bg-white/90"
            >
              Try AI Planner
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
