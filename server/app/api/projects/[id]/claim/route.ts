import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { submitClaimSchema, type SubmitClaimInput } from '@/lib/validators';
import { submitClaim } from '@/lib/services/claim.service';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Submit a claim for a project
 * POST /api/projects/:id/claim
 */
export const POST = createPostHandler(
  async (req: NextRequest, { params }: RouteParams) => {
    const user = getRequestUser(req);
    const body = getValidatedBody<SubmitClaimInput>(req);
    
    const claim = await submitClaim(user, params.id, body);
    
    return NextResponse.json(
      successResponse({
        message: 'Claim submitted successfully',
        claim,
      }),
      { status: 201 }
    );
  },
  submitClaimSchema,
  { requireAuth: true, requireRoles: ['user', 'builder', 'moderator', 'admin'] }
);

