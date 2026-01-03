import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  WelcomeHeader,
  PlanTripCTA,
  QuickNavigation,
  UpcomingTrips,
  PopularDestinations,
  BudgetSnapshot,
} from '../components/dashboard';
import type { Trip } from '../components/dashboard';
import { getUserTrips } from '../services/trip.service';

const Dashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    totalBudget: 0,
    totalSpent: 0,
    upcomingTripBudget: undefined as number | undefined,
    upcomingTripName: undefined as string | undefined,
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await getUserTrips();
        if (response.success && response.data) {
          // Map the response data to Trip format
          const tripsData: Trip[] = response.data.map((trip) => ({
            id: trip.id,
            name: trip.name,
            description: trip.description,
            startDate: trip.startDate,
            endDate: trip.endDate,
            coverImage: trip.coverImage,
            cities: trip.cities || [],
            status: trip.status,
          }));
          setTrips(tripsData);
          
          // Calculate budget data
          let totalBudget = 0;
          let totalSpent = 0;
          
          response.data.forEach((trip) => {
            if (trip.budget) {
              totalBudget += trip.budget.totalBudget || 0;
              totalSpent += trip.budget.calculated?.actualSpent || 0;
            }
          });

          // Find next upcoming trip
          const now = new Date();
          const upcomingTrips = response.data
            .filter(trip => new Date(trip.startDate) > now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          
          const nextTrip = upcomingTrips[0];
          
          setBudgetData({
            totalBudget,
            totalSpent,
            upcomingTripBudget: nextTrip?.budget?.totalBudget,
            upcomingTripName: nextTrip?.name,
          });
        }
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen bg-slate-50 dark:bg-slate-950"
    >
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/25 via-purple-400/15 to-pink-300/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/20 via-indigo-300/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.07),transparent_35%)]" />
      </div>

      <div className="relative w-full flex justify-center px-4 sm:px-6 lg:px-10 py-10 md:py-12">
        <div className="w-full max-w-7xl space-y-7">
          {/* Welcome Header */}
          <WelcomeHeader />

          {/* Primary CTA - Plan New Trip */}
          <PlanTripCTA />

          {/* Quick Navigation */}
          <QuickNavigation />

          {/* Upcoming / Recent Trips */}
          <UpcomingTrips trips={trips} loading={loading} />

          {/* Popular Destinations */}
          <PopularDestinations />

          {/* Budget Snapshot */}
          <BudgetSnapshot
            totalBudget={budgetData.totalBudget}
            totalSpent={budgetData.totalSpent}
            upcomingTripBudget={budgetData.upcomingTripBudget}
            upcomingTripName={budgetData.upcomingTripName}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
