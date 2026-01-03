import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const motivationalQuotes = [
  'Plan your next adventure, one trip at a time',
  'The world is waiting for you to explore',
  'Every journey begins with a single step',
  'Adventure is out there, go find it',
  'Travel far, travel wide, travel deep',
];

export const WelcomeHeader = () => {
  const { user } = useAuthStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const randomQuote = motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(79,70,229,0.45)] px-5 md:px-7 py-5 mb-4"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-emerald-400/10 blur-2xl" />

      <div className="flex flex-col gap-2 relative z-10">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-100/70 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-200 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Welcome back
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl">👋</span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">{user?.firstName || 'Traveler'}</span>
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
          {randomQuote}
        </p>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;
