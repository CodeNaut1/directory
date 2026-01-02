/**
 * JWT token utilities
 * Handles token generation, signing, and verification
 */

import { SignJWT, jwtVerify } from 'jose';
import { AuthenticatedUser } from './middleware';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'your-secret-key-change-in-production'
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

console.log('🔑 JWT_EXPIRES_IN:', JWT_EXPIRES_IN, '| JWT_REFRESH_EXPIRES_IN:', JWT_REFRESH_EXPIRES_IN);

export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: AuthenticatedUser['role'];
  name?: string;
  [key: string]: unknown; // Index signature for JWTPayload compatibility
}

/**
 * Generate access token
 */
export async function generateAccessToken(user: AuthenticatedUser): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    ...(user.name && { name: user.name }),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(user.id)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(user: AuthenticatedUser): Promise<string> {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    ...(user.name && { name: user.name }),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
    .setSubject(user.id)
    .sign(JWT_REFRESH_SECRET);

  return token;
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);

    if (!payload.sub || !payload.email || !payload.role) {
      throw new Error('Invalid token payload');
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as AuthenticatedUser['role'],
      name: payload.name as string | undefined,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

