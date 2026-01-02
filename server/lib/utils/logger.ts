/**
 * Logging utilities
 * Uses Pino for request logging
 */

import pino from 'pino';

// Pino logger for request/response logging
// IMPORTANT: Removed pino-pretty transport to avoid worker thread crashes in Next.js
export const requestLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Removed transport to fix "Cannot find module worker.js" error
  // Use basic pino output instead
  base: {
    env: process.env.NODE_ENV,
  },
});

// Create child loggers for specific contexts
export const createLogger = (context: string) => {
  return requestLogger.child({ context });
};

// System logger (can be extended with Winston later)
export const systemLogger = requestLogger.child({ type: 'system' });

// Error logger
export const errorLogger = requestLogger.child({ type: 'error' });

// Request logger middleware helper
export function logRequest(method: string, path: string, statusCode: number, duration: number) {
  requestLogger.info({
    method,
    path,
    statusCode,
    duration: `${duration}ms`,
  });
}

// Error logging helper
export function logError(error: Error, context?: Record<string, unknown>) {
  errorLogger.error(
    {
      err: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      ...context,
    },
    error.message
  );
}