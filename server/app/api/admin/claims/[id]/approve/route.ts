import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { approveClaimSchema, type ApproveClaimInput } from '@/lib/validators';
import { approveClaim } from '@/lib/services/claim.service';
import { prisma } from '@/lib/db';
import {
  buildClaimEmailData,
  sendClaimApprovedToTeam,
  sendClaimApprovedToUser,
} from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Approve a claim (admin only)
 * POST /api/admin/claims/:id/approve
 */
export const POST = createPostHandler(
  async (req: NextRequest, context: RouteParams) => {
    const { id } = await context.params;
    const admin = getRequestUser(req);
    const body = getValidatedBody<ApproveClaimInput>(req);

    const claim = await approveClaim(admin, id, body);

    setImmediate(async () => {
      try {
        const fullClaim = await prisma.projectClaim.findUnique({
          where: { id: claim.id },
          include: {
            user: { select: { name: true, email: true } },
            project: { select: { name: true, slug: true } },
          },
        });

        if (!fullClaim) return;

        const emailData = buildClaimEmailData(fullClaim);
        await Promise.all([
          sendClaimApprovedToUser(emailData),
          sendClaimApprovedToTeam(emailData),
        ]);
      } catch (error) {
        console.error('⚠️ Failed to send claim approval emails:', error);
      }
    });

    return NextResponse.json(
      successResponse({
        message: 'Claim approved and project ownership transferred',
        claim,
      })
    );
  },
  approveClaimSchema,
  { requireAuth: true, requireRoles: ['moderator', 'admin'] }
);
