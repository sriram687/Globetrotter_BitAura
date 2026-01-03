/**
 * Main Layout Component
 * Wraps pages with navbar and footer
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} GlobeTrotter. Plan your perfect journey.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
