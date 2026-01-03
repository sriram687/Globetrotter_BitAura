import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

interface BudgetSnapshotProps {
  totalBudget: number;
  totalSpent: number;
  upcomingTripBudget?: number;
  upcomingTripName?: string;
}

export const BudgetSnapshot = ({ 
  totalBudget = 0, 
  totalSpent = 0, 
  upcomingTripBudget,
  upcomingTripName 
}: BudgetSnapshotProps) => {
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const getStatus = () => {
    if (percentUsed > 90) return { color: 'text-rose-500', bg: 'bg-rose-500', label: 'Over Budget', icon: FiAlertCircle };
    if (percentUsed > 75) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Warning', icon: FiTrendingUp };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'On Track', icon: FiTrendingDown };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.45 }}
      className="mb-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-900/60 backdrop-blur shadow-[0_22px_70px_-38px_rgba(15,23,42,0.7)] p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
          Budget Overview
        </h3>
        <Link 
          to="/budget" 
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium flex items-center gap-1"
        >
          Details <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Total Budget Card */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/70 rounded-2xl p-4 md:p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.75)] border border-slate-100/80 dark:border-slate-700/70 backdrop-blur">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute left-4 top-4 h-14 w-14 rounded-full bg-indigo-500/15 blur-xl" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <FiDollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budget</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color} bg-opacity-10 border border-white/30 dark:border-slate-700/70`} 
                 style={{ backgroundColor: `${status.color.replace('text-', '')}12` }}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </div>
          </div>
          
          <div className="mb-3">
            <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              ${totalBudget.toLocaleString()}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              total planned
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 bg-slate-100/80 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`absolute left-0 top-0 h-full ${status.bg} rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.25)]`}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs md:text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Spent: <span className="font-medium text-slate-900 dark:text-white">${totalSpent.toLocaleString()}</span>
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Left: <span className={`font-medium ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                ${Math.abs(remaining).toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* Upcoming Trip Budget */}
        {upcomingTripBudget !== undefined && upcomingTripName ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 rounded-2xl p-4 md:p-5 shadow-[0_22px_70px_-38px_rgba(99,102,241,0.75)] text-white border border-white/15">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-white/80">Upcoming Trip</span>
            </div>
            
            <h4 className="font-semibold text-lg mb-1 truncate">{upcomingTripName}</h4>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold">
                ${upcomingTripBudget.toLocaleString()}
              </span>
              <span className="text-sm text-white/70">budget</span>
            </div>
            
            <Link to="/budget" className="mt-3 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors">
              View breakdown <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white/85 dark:bg-slate-900/60 rounded-2xl p-4 md:p-5 border-2 border-dashed border-slate-200/80 dark:border-slate-700/70 flex flex-col items-center justify-center text-center backdrop-blur shadow-[0_20px_60px_-35px_rgba(15,23,42,0.6)]">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <FiDollarSign className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              No upcoming trip budget
            </p>
            <Link to="/trips/new" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
              Plan a trip
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BudgetSnapshot;
