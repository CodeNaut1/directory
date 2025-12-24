import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { projectListQuerySchema, createProjectSchema, type CreateProjectInput, type ProjectListQuery } from '@/lib/validators';
import { listProjects, createProject } from '@/lib/services/project.service';

/**
 * List projects
 * GET /api/projects
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = projectListQuerySchema.parse(searchParams) as ProjectListQuery;
    
    const result = await listProjects(query);
    
    return NextResponse.json(successResponse(result.data, result.meta));
  },
  { validateQuery: projectListQuerySchema }
);

/**
 * Create a new project
 * POST /api/projects
 */
export const POST = createPostHandler(
  async (req: NextRequest) => {
    const user = getRequestUser(req);
    const body = getValidatedBody<CreateProjectInput>(req);
    
    const project = await createProject(user, body);
    
    return NextResponse.json(successResponse(project), { status: 201 });
  },
  createProjectSchema,
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

