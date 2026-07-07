import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { revokeClaimSchema, type RevokeClaimInput } from '@/lib/validators';
import { revokeClaim } from '@/lib/services/claim.service';
import {
  buildClaimEmailData,
  sendClaimRevokedToTeam,
  sendClaimRevokedToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Revoke an approved ownership claim (admin only)
 * POST /api/admin/claims/:id/revoke
 */
export const POST = createPostHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const admin = getRequestUser(req);
    const body = getValidatedBody<RevokeClaimInput>(req);

    const claim = await revokeClaim(admin, id, body);

    setImmediate(async () => {
      try {
        const emailData = buildClaimEmailData(claim);
        await Promise.all([
          sendClaimRevokedToUser(emailData, body.reason),
          sendClaimRevokedToTeam(emailData, body.reason),
        ]);
      } catch (error) {
        console.error('⚠️ Failed to send claim revocation emails:', error);
      }
    });

    return NextResponse.json(
      successResponse({
        message: 'Ownership claim revoked and project ownership removed',
        claim,
      })
    );
  },
  revokeClaimSchema,
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);
