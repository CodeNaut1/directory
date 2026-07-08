import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { scheduleProjectsJsonSync } from '@/lib/services/projects-json-sync.service';
import {
  buildProjectActionEmailData,
  sendChangesRequestedToTeam,
  sendChangesRequestedToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const feedbackSchema = z.object({
  notes: z.string().min(1, 'Feedback notes are required').max(2000),
});

/**
 * Request changes on a project (admin only)
 * POST /api/admin/projects/:id/feedback
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
    const body = feedbackSchema.parse(await req.json());

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
        status: 'changes_requested',
        adminFeedbackNotes: body.notes,
        adminFeedbackAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
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

        const baseData = buildProjectActionEmailData(fullProject);
        const changesData = baseData
          ? { ...baseData, feedback: body.notes }
          : {
              userName: 'Unknown',
              userEmail: '',
              projectName: fullProject.name,
              projectSlug: fullProject.slug,
              feedback: body.notes,
            };

        const tasks = [sendChangesRequestedToTeam(changesData)];
        if (baseData) {
          tasks.unshift(sendChangesRequestedToUser({ ...baseData, feedback: body.notes }));
        }

        await Promise.all(tasks);
      } catch (error) {
        console.error('⚠️ Failed to send changes-requested emails:', error);
      }
    });

    return NextResponse.json(
      successResponse({
        message: 'Feedback recorded — project marked as needing updates',
        project,
        notes: body.notes,
      })
    );
  } catch (error: any) {
    console.error('Error sending project feedback:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send feedback' },
      { status: 500 }
    );
  }
}
