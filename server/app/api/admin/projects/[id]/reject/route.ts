import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Reject a project (admin only)
 * POST /api/admin/projects/:id/reject
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    // Authenticate and check admin role
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true, status: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project to rejected
    const project = await prisma.project.update({
      where: { id },
      data: {
        status: 'rejected',
        published: false, // Keep unpublished
      },
      select: {
        id: true,
        name: true,
        slug: true,
        published: true,
        status: true,
      },
    });

    return NextResponse.json(
      successResponse({
        message: 'Project rejected',
        project,
      })
    );
  } catch (error: any) {
    console.error('Error rejecting project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject project' },
      { status: 500 }
    );
  }
}