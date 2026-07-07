import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { rejectClaimSchema, type RejectClaimInput } from '@/lib/validators';
import { rejectClaim } from '@/lib/services/claim.service';
import {
  buildClaimEmailData,
  sendClaimRejectedToTeam,
  sendClaimRejectedToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Reject a claim (admin only)
 * POST /api/admin/claims/:id/reject
 */
export const POST = createPostHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const admin = getRequestUser(req);
    const body = getValidatedBody<RejectClaimInput>(req);

    const claim = await rejectClaim(admin, id, body);

    setImmediate(async () => {
      try {
        const emailData = buildClaimEmailData(claim);
        await Promise.all([
          sendClaimRejectedToUser(emailData),
          sendClaimRejectedToTeam(emailData),
        ]);
      } catch (error) {
        console.error('⚠️ Failed to send claim rejection emails:', error);
      }
    });

    return NextResponse.json(
      successResponse({
        message: 'Claim rejected',
        claim,
      })
    );
  },
  rejectClaimSchema,
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);
