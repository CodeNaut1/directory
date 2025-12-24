import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { submitProjectSchema, type SubmitProjectInput } from '@/lib/validators';
import { submitProjectForReview } from '@/lib/services/project.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Submit project for review
 * POST /api/projects/:id/submit
 */
export const POST = createPostHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const user = getRequestUser(req);
    const body = getValidatedBody<SubmitProjectInput>(req);
    
    const submission = await submitProjectForReview(user, params.id, body.notes);
    
    return NextResponse.json(
      successResponse({
        message: 'Project submitted for review',
        submission,
      })
    );
  },
  submitProjectSchema,
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

