import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getUserProjects } from '@/lib/services/project.service';

/**
 * Get current user's projects (including unpublished)
 * GET /api/projects/my-projects
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    // Get authenticated user (this will throw 401 if not authenticated)
    const user = getRequestUser(req);

    const projects = await getUserProjects(user.id);

    return NextResponse.json(successResponse(projects));
  },
  { requireAuth: true } // Add this option to require authentication
);