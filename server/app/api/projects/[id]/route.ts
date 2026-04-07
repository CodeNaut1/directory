import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, createPatchHandler, createDeleteHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { updateProjectSchema, type UpdateProjectInput } from '@/lib/validators';
import { getProjectById, updateProject, deleteProject } from '@/lib/services/project.service';
import { AuthenticatedUser } from '@/lib/auth/middleware';

interface RouteParams {
  params: {
    id: string;
  };
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
  async (req: NextRequest, { params }: RouteParams) => {
    // Get user if authenticated (but don't require auth)
    let user: AuthenticatedUser | undefined;
    try {
      user = getRequestUser(req);
    } catch {
      // User not authenticated, that's fine
      user = undefined;
    }

    const project = await getProjectById(params.id, user);  // ← Pass user
    return NextResponse.json(successResponse(project));
  },
  { requireAuth: false }  // ← Don't require auth for public viewing
);

/**
 * Update project
 * PATCH /api/projects/:id
 */
export const PATCH = createPatchHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const user = getRequestUser(req);
    const body = getValidatedBody<UpdateProjectInput>(req);

    const project = await updateProject(user, params.id, body);

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
  async (req: NextRequest, { params }: RouteParams) => {
    const user = getRequestUser(req);

    await deleteProject(user, params.id);

    return NextResponse.json(
      successResponse({ message: 'Project deleted successfully' })
    );
  },
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

