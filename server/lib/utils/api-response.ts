/**
 * Standardized API response utility
 * Ensures consistent response structure across all endpoints
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

export function errorResponse(
  message: string,
  code?: string
): ApiResponse<never> {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
    },
  };
}

