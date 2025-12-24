/**
 * Authentication middleware utilities
 * Handles JWT token validation and user extraction
 */

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { AuthenticationError } from '../utils/errors';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  if (!secret || secret === 'your-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Change this in production!');
  }
  return new TextEncoder().encode(secret);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'builder' | 'moderator' | 'admin';
  name?: string;
}

/**
 * Extract and verify JWT token from request
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    
    // Validate payload structure
    if (!payload.sub || !payload.email || !payload.role) {
      throw new AuthenticationError('Invalid token payload');
    }

    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as AuthenticatedUser['role'],
      name: payload.name as string | undefined,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRoles: AuthenticatedUser['role'][]): boolean {
  const roleHierarchy: Record<AuthenticatedUser['role'], number> = {
    user: 1,
    builder: 2,
    moderator: 3,
    admin: 4,
  };

  const userRoleLevel = roleHierarchy[user.role];
  return requiredRoles.some((role) => roleHierarchy[role] <= userRoleLevel);
}

/**
 * Require authentication middleware helper
 */
export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser> {
  return getAuthenticatedUser(req);
}

/**
 * Require specific role(s) middleware helper
 */
export async function requireRole(
  req: NextRequest,
  roles: AuthenticatedUser['role'][]
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(req);
  
  if (!hasRole(user, roles)) {
    throw new AuthenticationError('Insufficient permissions');
  }
  
  return user;
}

