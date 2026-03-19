import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateRoleSchema = z.object({
  role: z.enum(['user', 'builder', 'moderator', 'admin']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const { user: currentUser } = authResult;

    // Only admins can change roles
    if (currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { message: 'Forbidden: Admin access required' } },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    // Prevent self-demotion
    if (userId === currentUser.id && role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { message: 'You cannot change your own role' } },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to update user role',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}