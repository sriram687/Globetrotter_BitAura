/**
 * Authentication Service
 * Handles login, signup, and auth state
 */

import api from './api';
import type { ApiResponse } from './api';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  country?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count?: {
    trips: number;
  };
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type RegisterData = {    
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type LoginData = {
  email: string;
  password: string;
};

// Register new user
export const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data;
};

// Forgot password
export const forgotPassword = async (email: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token: string, password: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
  return response.data;
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

// Verify token
export const verifyToken = async (): Promise<ApiResponse<{ valid: boolean; user: User }>> => {
  const response = await api.post<ApiResponse<{ valid: boolean; user: User }>>('/auth/verify-token');
  return response.data;
};

// Logout (client-side)
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
