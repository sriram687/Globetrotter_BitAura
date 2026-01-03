/**
 * Main App Component
 * React Router setup and route definitions
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Loading } from './components/ui';
import { MainLayout, AuthLayout } from './components/layout';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import './index.css';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Guest Route wrapper (redirect to dashboard if logged in)
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Page wrapper with animation
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <Loading size="lg" text="Loading..." />
  </div>
);

// Animated Routes wrapper
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthLayout>
                <PageWrapper>
                  <LoginPage />
                </PageWrapper>
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthLayout>
                <PageWrapper>
                  <RegisterPage />
                </PageWrapper>
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <AuthLayout>
                <PageWrapper>
                  <ForgotPasswordPage />
                </PageWrapper>
              </AuthLayout>
            </GuestRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes - will be implemented later */}
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Trips</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Trip</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Details</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Explore</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budget</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-planner"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Planner</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageWrapper>
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Coming soon...</p>
                  </div>
                </PageWrapper>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
                <a
                  href="/dashboard"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const { isDark } = useThemeStore();

  // Apply dark mode class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#1e293b',
            borderRadius: '12px',
            border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </Router>
  );
};

export default App;
