import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { getAllCategories } from '@/lib/services/category.service';

/**
 * Get all categories
 * GET /api/categories
 */
export const GET = createGetHandler(async (req: NextRequest) => {
  const categories = await getAllCategories();
  return NextResponse.json(successResponse(categories));
});

