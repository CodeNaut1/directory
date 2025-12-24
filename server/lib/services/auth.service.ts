/**
 * Authentication service
 * Handles user registration, login, and authentication business logic
 */

import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { ConflictError, AuthenticationError } from '@/lib/utils/errors';
import type { RegisterInput, LoginInput } from '@/lib/validators';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new user
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'user', // Default role
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
    },
  });

  // Generate tokens
  const accessToken = await generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'builder' | 'moderator' | 'admin',
    name: user.name || undefined,
  });

  const refreshToken = await generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'builder' | 'moderator' | 'admin',
    name: user.name || undefined,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

/**
 * Login user
 */
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  }).catch(() => {
    // Non-critical, continue even if update fails
  });

  // Generate tokens
  const accessToken = await generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'builder' | 'moderator' | 'admin',
    name: user.name || undefined,
  });

  const refreshToken = await generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'builder' | 'moderator' | 'admin',
    name: user.name || undefined,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

