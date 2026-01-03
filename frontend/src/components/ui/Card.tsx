/**
 * Card Component
 * Reusable card with animations
 */

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
  onClick,
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  const baseStyles = `
    rounded-2xl
    ${glass 
      ? 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50' 
      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
    }
    ${paddings[padding]}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={`${baseStyles} shadow-lg hover:shadow-xl transition-shadow ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} shadow-lg ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
