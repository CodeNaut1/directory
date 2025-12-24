/**
 * Logging utilities
 * Uses Pino for request logging and Winston for system logs
 */

import pino from 'pino';

// Pino logger for request/response logging
export const requestLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
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

