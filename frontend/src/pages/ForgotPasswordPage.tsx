/**
 * Forgot Password Page
 * Request password reset email
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';
import * as authService from '../services/auth.service';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Reset link sent!');
    } catch (error: unknown) {
      // Don't reveal if email exists or not
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
      {/* Mobile logo */}
      <div className="lg:hidden text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to login
            </Link>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                <FiMail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                No worries, we'll send you reset instructions
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={error}
                leftIcon={<FiMail className="w-5 h-5" />}
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                Send Reset Link
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <FiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We've sent a password reset link to<br />
              <span className="font-medium text-slate-900 dark:text-white">{email}</span>
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Didn't receive the email?{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                Click to resend
              </button>
            </p>

            <Link to="/login">
              <Button variant="outline" fullWidth>
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPasswordPage;
