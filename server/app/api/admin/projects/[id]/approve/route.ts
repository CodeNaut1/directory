import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { scheduleProjectsJsonSync } from '@/lib/services/projects-json-sync.service';
import {
  buildProjectActionEmailData,
  sendProjectApprovedToTeam,
  sendProjectApprovedToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Approve a project (admin only)
 * POST /api/admin/projects/:id/approve
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

    setImmediate(async () => {
      try {
        const fullProject = await prisma.project.findUnique({
          where: { id: project.id },
          select: {
            name: true,
            slug: true,
            user: { select: { name: true, email: true } },
          },
        });

        if (!fullProject) return;

        const emailData = buildProjectActionEmailData(fullProject);
        const tasks = [sendProjectApprovedToTeam(emailData || {
          userName: 'Unknown',
          userEmail: '',
          projectName: fullProject.name,
          projectSlug: fullProject.slug,
        })];

        if (emailData) {
          tasks.unshift(sendProjectApprovedToUser(emailData));
        }

        await Promise.all(tasks);
      } catch (error) {
        console.error('⚠️ Failed to send approval emails:', error);
      }
    });

    return NextResponse.json(
      successResponse({
        message: 'Project approved successfully',
        project,
      })
    );
  } catch (error: any) {
    console.error('Error approving project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve project' },
      { status: 500 }
    );
  }
}
