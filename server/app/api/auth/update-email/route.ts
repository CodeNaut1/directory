import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { AuthenticationError, ConflictError } from '@/lib/utils/errors';
import { z } from 'zod';

const updateEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Update user email
 * POST /api/auth/update-email
 */
export const POST = createPostHandler(
  async (req: NextRequest) => {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    const body = getValidatedBody<z.infer<typeof updateEmailSchema>>(req);

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.passwordHash) {
      throw new AuthenticationError('User not found');
    }

    // Verify password
    const isValidPassword = await verifyPassword(body.password, dbUser.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid password');
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: body.newEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw new ConflictError('Email address is already in use');
    }

    // Update email
    await prisma.user.update({
      where: { id: user.id },
      data: { email: body.newEmail },
    });

    return NextResponse.json(
      successResponse({
        message: 'Email updated successfully',
      })
    );
  },
  updateEmailSchema
);