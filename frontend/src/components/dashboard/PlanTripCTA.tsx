import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiMap, FiCompass } from 'react-icons/fi';

export const PlanTripCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.08 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 p-5 md:p-8 mb-5 shadow-[0_25px_80px_-35px_rgba(79,70,229,0.65)] border border-white/10"
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-white/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_35%)]" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md border border-white/20">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            New AI assistant just added
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
            Ready for your next adventure?
          </h2>
          <p className="text-white/85 text-sm md:text-base lg:text-lg max-w-2xl">
            Plan in minutes with smart suggestions, curated inspiration, and live budget guidance.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/trips/new" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-[0_20px_45px_-15px_rgba(255,255,255,0.55)] hover:shadow-[0_25px_55px_-20px_rgba(255,255,255,0.75)] transition-all"
            >
              <FiPlus className="w-5 h-5" />
              Plan New Trip
            </motion.button>
          </Link>
          
          <Link to="/ai-planner" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-white/15 text-white font-semibold rounded-xl backdrop-blur-lg border border-white/25 hover:bg-white/25 transition-all"
            >
              <FiCompass className="w-5 h-5" />
              AI Planner
            </motion.button>
          </Link>
        </div>
      </div>
      
      {/* Background icon */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 opacity-10">
        <FiMap className="w-20 h-20 md:w-32 md:h-32 text-white" />
      </div>
    </motion.div>
  );
};

export default PlanTripCTA;
