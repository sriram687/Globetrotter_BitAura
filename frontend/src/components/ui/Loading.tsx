/**
 * Loading Components
 * Spinner and skeleton loaders
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Main Loading component with text support
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <svg
        className={`animate-spin text-indigo-600 ${sizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-slate-600 dark:text-slate-400 text-sm">{text}</p>}
    </div>
  );
};

// Spinner
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin text-indigo-600 ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Full page loader
export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full"
      />
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
    </motion.div>
  </div>
);

// Skeleton line
export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
);

// Skeleton card
export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-700">
    <div className="skeleton h-40 rounded-xl mb-4" />
    <div className="skeleton h-6 w-3/4 rounded mb-2" />
    <div className="skeleton h-4 w-1/2 rounded mb-4" />
    <div className="flex gap-2">
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  </div>
);

// Skeleton list
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-5 w-1/3 rounded mb-2" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default Spinner;
