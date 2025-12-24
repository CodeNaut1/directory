import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { searchQuerySchema, type SearchQuery } from '@/lib/validators';
import { searchProjects } from '@/lib/services/search.service';

/**
 * Search projects
 * GET /api/search
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = searchQuerySchema.parse(searchParams) as SearchQuery;
    
    const result = await searchProjects(query);
    
    return NextResponse.json(successResponse(result.data, result.meta));
  },
  { validateQuery: searchQuerySchema }
);

