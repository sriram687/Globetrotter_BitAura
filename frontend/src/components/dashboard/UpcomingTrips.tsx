import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight, FiPlus } from 'react-icons/fi';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  cities: { id: string; name: string }[];
  status: string;
}

interface UpcomingTripsProps {
  trips: Trip[];
  loading?: boolean;
}

const TripCard = ({ trip, index }: { trip: Trip; index: number }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(date);
    tripDate.setHours(0, 0, 0, 0);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(trip.startDate);
  
  const getStatusBadge = () => {
    if (trip.status === 'ONGOING') return { text: 'In Progress', color: 'bg-green-500' };
    if (daysUntil === 0) return { text: 'Today!', color: 'bg-green-500' };
    if (daysUntil > 0) return { text: `${daysUntil} days away`, color: 'bg-blue-500' };
    return { text: 'Past', color: 'bg-slate-500' };
  };

  const badge = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group"
    >
      <Link to={`/trips/${trip.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/70 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.75)] hover:shadow-[0_30px_80px_-30px_rgba(79,70,229,0.55)] transition-all border border-slate-100/80 dark:border-slate-700/70 backdrop-blur">
          <div className="relative h-32 md:h-36 overflow-hidden">
            <img
              src={trip.coverImage || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80`}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />
            <div className={`absolute top-2 left-2 ${badge.color} px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-md`}>
              {badge.text}
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/80 text-[11px] font-semibold text-slate-800">
              {trip.cities?.length || 0} stops
            </div>
          </div>
          
          <div className="p-4 md:p-5 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-base md:text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {trip.name}
            </h4>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4 text-indigo-500" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiMapPin className="w-4 h-4 text-emerald-500" />
                <span>{trip.cities?.length || 0} {(trip.cities?.length || 0) === 1 ? 'city' : 'cities'}</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <FiArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-10 md:py-12 px-4 md:px-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur rounded-2xl border-2 border-dashed border-slate-200/80 dark:border-slate-700/70 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.6)]"
  >
    <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
      <FiMapPin className="w-7 h-7 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white mb-2">
      No trips planned yet
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mb-5 md:mb-6 max-w-sm mx-auto text-sm md:text-base">
      Start your journey by creating your first trip. We'll help you plan every detail!
    </p>
    <Link to="/trips/new">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm md:text-base"
      >
        <FiPlus className="w-4 h-4 md:w-5 md:h-5" />
        Create Your First Trip
      </motion.button>
    </Link>
  </motion.div>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-28 md:h-32 bg-slate-200/70 dark:bg-slate-700/70 rounded-t-xl" />
        <div className="p-3 md:p-4 bg-white/90 dark:bg-slate-800/80 rounded-b-xl border border-slate-100/80 dark:border-slate-700/70">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const UpcomingTrips = ({ trips, loading }: UpcomingTripsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-900/60 backdrop-blur shadow-[0_22px_70px_-38px_rgba(15,23,42,0.7)] p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
          Your Trips
        </h3>
        {trips.length > 0 && (
          <Link 
            to="/trips" 
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium flex items-center gap-1"
          >
            View all <FiArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <AnimatePresence>
            {trips.slice(0, 6).map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default UpcomingTrips;
