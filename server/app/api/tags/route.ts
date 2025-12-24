import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getAllTags } from '@/lib/services/tag.service';

/**
 * Get all tags
 * GET /api/tags
 */
export const GET = createGetHandler(async (req: NextRequest) => {
  const tags = await getAllTags();
  return NextResponse.json(successResponse(tags));
});

