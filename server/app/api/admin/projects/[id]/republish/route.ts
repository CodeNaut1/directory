import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { scheduleProjectsJsonSync } from '@/lib/services/projects-json-sync.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Republish a previously unpublished project (admin only)
 * POST /api/admin/projects/:id/republish
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

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

    const project = await prisma.project.update({
      where: { id },
      data: {
        status: 'approved',
        publishedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        publishedAt: true,
      },
    });

    scheduleProjectsJsonSync(project.id);

    return NextResponse.json(
      successResponse({
        message: 'Project republished successfully',
        project,
      })
    );
  } catch (error: any) {
    console.error('Error republishing project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to republish project' },
      { status: 500 }
    );
  }
}
