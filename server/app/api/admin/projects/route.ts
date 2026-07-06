import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';

/**
 * Get all projects for admin dashboard (any status)
 * GET /api/admin/projects
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        country: {
          select: { id: true, code: true, name: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(successResponse(projects));
  } catch (error: any) {
    console.error('Error fetching admin projects:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
