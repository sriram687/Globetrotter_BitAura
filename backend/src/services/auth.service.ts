/**
 * Authentication Service
 * Handles user registration, login, and password management
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken, generateResetToken, hashResetToken } from '../utils/jwt.utils';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData) => {
  const { email, password, firstName, lastName } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { user, token };
};

/**
 * Login user
 */
export const login = async (data: LoginData) => {
  const { email, password } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role
    },
    token
  };
};

/**
 * Initiate forgot password process
 */
export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateResetToken();
  const hashedToken = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  // Save to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExp: expiresAt
    }
  });

  // In production, send email with reset link
  // For now, return token (in dev only)
  return {
    message: 'If email exists, reset link has been sent',
    // Remove in production:
    resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
  };
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = hashResetToken(token);

  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null
    }
  });

  return { message: 'Password reset successful' };
};

/**
 * Change password (for logged in users)
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { message: 'Password changed successfully' };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      bio: true,
      phone: true,
      country: true,
      preferences: true,
      role: true,
      createdAt: true,
      _count: {
        select: { trips: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
