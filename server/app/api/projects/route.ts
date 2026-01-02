import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { projectListQuerySchema, type ProjectListQuery } from '@/lib/validators';
import { listProjects } from '@/lib/services/project.service';

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