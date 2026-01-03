/**
 * API Response Utility
 * Standardized response formatting
 */

import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: SuccessResponse<T>['meta']
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: ErrorResponse['errors']
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (
  res: Response,
  errors: Array<{ field?: string; message: string }>
): Response => {
  return sendError(res, 'Validation failed', 400, errors);
};

/**
 * Send not found response
 */
export const sendNotFound = (
  res: Response,
  resource: string = 'Resource'
): Response => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized access'
): Response => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access forbidden'
): Response => {
  return sendError(res, message, 403);
};
