import { NextRequest, NextResponse } from 'next/server';
import { successResponse } from '@/lib/utils/api-response';
import { findDuplicateProjects } from '@/lib/services/project.service';

/**
 * Check for duplicate project submissions
 * POST /api/projects/check-duplicate
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, twitter, excludeProjectId } = body ?? {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: { message: 'Project name is required' } },
        { status: 400 }
      );
    }

    const duplicates = await findDuplicateProjects({
      name,
      website: typeof website === 'string' ? website : undefined,
      twitter: typeof twitter === 'string' ? twitter : undefined,
      excludeProjectId: typeof excludeProjectId === 'string' ? excludeProjectId : undefined,
    });

    return NextResponse.json(successResponse(duplicates));
  } catch (error) {
    console.error('Error in POST /api/projects/check-duplicate:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
