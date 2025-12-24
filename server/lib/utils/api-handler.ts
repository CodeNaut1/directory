/**
 * API Route Handler Wrapper
 * Provides error handling, logging, and validation utilities for Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { errorResponse } from './api-response';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from './errors';
import { logError, logRequest } from './logger';
import { getAuthenticatedUser, hasRole, AuthenticatedUser } from '../auth/middleware';

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse | Response>;

interface HandlerOptions {
  requireAuth?: boolean;
  requireRoles?: Array<'user' | 'builder' | 'moderator' | 'admin'>;
  validateBody?: ZodSchema;
  validateQuery?: ZodSchema;
}

/**
 * Wraps an API route handler with error handling, validation, and logging
 */
export function createApiHandler(
  handler: Handler,
  options: HandlerOptions = {}
): Handler {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();
    const method = req.method;
    const path = req.nextUrl.pathname;

    try {
      // Authentication check (lazy import to avoid issues if auth not needed)
      let authenticatedUser: AuthenticatedUser | null = null;
      if (options.requireAuth) {
        try {
          authenticatedUser = await getAuthenticatedUser(req);
          // Check roles if specified
          if (options.requireRoles && authenticatedUser) {
            if (!hasRole(authenticatedUser, options.requireRoles)) {
              throw new AuthorizationError('Insufficient permissions for this operation');
            }
          }
          // Attach user to request for handler access
          (req as any).user = authenticatedUser;
        } catch (authError) {
          // Re-throw auth errors as-is
          throw authError;
        }
      }

      // Validate query parameters
      if (options.validateQuery) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
        options.validateQuery.parse(searchParams);
      }

      // Validate request body (for POST, PUT, PATCH)
      if (options.validateBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        let body = {};
        try {
          body = await req.json();
        } catch (error) {
          // If JSON parsing fails, body remains empty object
          // Validation will catch missing required fields
        }
        options.validateBody.parse(body);
        // Re-attach parsed body to request for handler
        (req as any).parsedBody = body;
      }

      // Execute handler
      const response = await handler(req, context);

      // Log successful request
      const duration = Date.now() - startTime;
      logRequest(method, path, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle different error types
      if (error instanceof ZodError) {
        // Validation error
        const validationError = new ValidationError(
          error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
        logError(validationError, { method, path, duration });
        return NextResponse.json(errorResponse(validationError.message, 'VALIDATION_ERROR'), {
          status: validationError.statusCode,
        });
      }

      if (error instanceof AppError) {
        // Known application error
        logError(error, { method, path, duration, code: error.code });
        return NextResponse.json(errorResponse(error.message, error.code), {
          status: error.statusCode,
        });
      }

      // Unknown error
      const unknownError = error instanceof Error ? error : new Error('Unknown error');
      logError(unknownError, { method, path, duration });
      
      return NextResponse.json(
        errorResponse(
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : unknownError.message,
          'INTERNAL_ERROR'
        ),
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to extract validated body from request
 */
export function getValidatedBody<T>(req: NextRequest): T {
  return (req as any).parsedBody as T;
}

/**
 * Helper to get authenticated user from request
 */
export function getRequestUser(req: NextRequest): AuthenticatedUser {
  const user = (req as any).user as AuthenticatedUser;
  if (!user) {
    throw new AuthenticationError('User not authenticated');
  }
  return user;
}

/**
 * Helper to create a GET handler
 */
export function createGetHandler(handler: Handler, options?: HandlerOptions): Handler {
  return createApiHandler(handler, options);
}

/**
 * Helper to create a POST handler
 */
export function createPostHandler(
  handler: Handler,
  bodySchema?: ZodSchema,
  options?: Omit<HandlerOptions, 'validateBody'>
): Handler {
  return createApiHandler(handler, {
    ...options,
    validateBody: bodySchema,
  });
}

/**
 * Helper to create a PATCH handler
 */
export function createPatchHandler(
  handler: Handler,
  bodySchema?: ZodSchema,
  options?: Omit<HandlerOptions, 'validateBody'>
): Handler {
  return createApiHandler(handler, {
    ...options,
    validateBody: bodySchema,
  });
}

/**
 * Helper to create a DELETE handler
 */
export function createDeleteHandler(handler: Handler, options?: HandlerOptions): Handler {
  return createApiHandler(handler, options);
}

