import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';

/**
 * Get all pending projects (admin only)
 * GET /api/admin/projects/pending
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate and check admin role
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all pending projects
    const projects = await prisma.project.findMany({
      where: {
        status: 'pending',
      },
      orderBy: {
        createdAt: 'desc', // Newest submissions first
      },
      include: {
        country: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(successResponse(projects));
  } catch (error: any) {
    console.error('Error fetching pending projects:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pending projects' },
      { status: 500 }
    );
  }
}