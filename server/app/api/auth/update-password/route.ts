import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth/password';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { AuthenticationError } from '@/lib/utils/errors';
import { z } from 'zod';

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * Update user password
 * POST /api/auth/update-password
 */
export const POST = createPostHandler(
  async (req: NextRequest) => {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    const body = getValidatedBody<z.infer<typeof updatePasswordSchema>>(req);

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.passwordHash) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(body.currentPassword, dbUser.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(body.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json(
      successResponse({
        message: 'Password updated successfully',
      })
    );
  },
  updatePasswordSchema
);