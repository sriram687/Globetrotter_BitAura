import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMap, FiCompass, FiDollarSign, FiCalendar, FiHeart, FiShare2 } from 'react-icons/fi';

const navItems = [
  { icon: FiMap, label: 'My Trips', path: '/trips', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/30' },
  { icon: FiCompass, label: 'Explore', path: '/explore', color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },
  { icon: FiDollarSign, label: 'Budget', path: '/budget', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-900/30' },
  { icon: FiCalendar, label: 'Calendar', path: '/calendar', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/30' },
  { icon: FiHeart, label: 'Saved', path: '/trips?filter=saved', color: 'bg-rose-500', hoverColor: 'hover:bg-rose-50 dark:hover:bg-rose-900/30' },
  { icon: FiShare2, label: 'Shared', path: '/trips?filter=shared', color: 'bg-indigo-500', hoverColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30' },
];

export const QuickNavigation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="mb-6 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-900/60 backdrop-blur shadow-[0_22px_70px_-38px_rgba(15,23,42,0.7)] p-4 md:p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
            Quick Access
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">Shortcut to your essentials</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 md:gap-3">
        {navItems.map((item, index) => (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex flex-col items-center p-3 md:p-4 bg-white/90 dark:bg-slate-900/70 rounded-xl shadow-[0_20px_60px_-35px_rgba(15,23,42,0.65)] hover:shadow-[0_20px_60px_-25px_rgba(79,70,229,0.45)] transition-all cursor-pointer border border-slate-100/80 dark:border-slate-700/70 backdrop-blur ${item.hoverColor}`}
            >
              <div className={`${item.color} p-2.5 md:p-3 rounded-full mb-2 shadow-lg shadow-black/10`}>
                <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickNavigation;
