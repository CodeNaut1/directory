import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, createPatchHandler, createDeleteHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { updateProjectSchema, type UpdateProjectInput } from '@/lib/validators';
import { getProjectById, updateProject, deleteProject } from '@/lib/services/project.service';
import { verifyAuth } from '@/lib/auth/middleware';
import {
  sendProjectUpdateToTeam,
  sendProjectUpdateToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get project by ID or slug
 * GET /api/projects/:id
 */
// export const GET = createGetHandler(
//   async (req: NextRequest, { params }: RouteParams) => {
//     const project = await getProjectById(params.id);
//     return NextResponse.json(successResponse(project));
//   }
// );

export const GET = createGetHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const { user } = await verifyAuth(req);

    const project = await getProjectById(id, user ?? undefined);
    return NextResponse.json(successResponse(project));
  },
  { requireAuth: false }
);

/**
 * Update project
 * PATCH /api/projects/:id
 */
export const PATCH = createPatchHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const user = getRequestUser(req);
    const body = getValidatedBody<UpdateProjectInput>(req);

    const { project, submittedForReview } = await updateProject(user, id, body);

    if (submittedForReview) {
      setImmediate(async () => {
        try {
          const submittedAt = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Lagos',
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          const emailData = {
            userName: user.name || user.email.split('@')[0],
            userEmail: user.email,
            projectName: project.name as string,
            country: (project.country_name as string) || '',
            category: ((project.categories as string[]) || [])[0] || '',
            description: (project.description as string) || '',
            website: (project.website as string) || undefined,
            submittedAt,
          };

          await Promise.all([
            sendProjectUpdateToUser(emailData),
            sendProjectUpdateToTeam(emailData),
          ]);
        } catch (error) {
          console.error('⚠️ Failed to send project update emails:', error);
        }
      });
    }

    return NextResponse.json(successResponse(project));
  },
  updateProjectSchema,
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const DELETE = createDeleteHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const user = getRequestUser(req);

    await deleteProject(user, id);

    return NextResponse.json(
      successResponse({ message: 'Project deleted successfully' })
    );
  },
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

