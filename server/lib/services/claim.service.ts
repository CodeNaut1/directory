/**
 * Claim service
 * Handles project ownership claim business logic
 */

import { prisma } from '@/lib/db';
import { NotFoundError, AuthorizationError, ValidationError } from '@/lib/utils/errors';
import type { AuthenticatedUser } from '@/lib/auth/middleware';
import type { SubmitClaimInput, ApproveClaimInput, RejectClaimInput, RevokeClaimInput, ClaimListQuery } from '@/lib/validators';

/**
 * Submit a claim for a project
 */
export async function submitClaim(
  user: AuthenticatedUser,
  projectId: string,
  input: SubmitClaimInput
) {
  // Check if project exists and is publicly visible
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      userId: true,
      status: true,
      name: true,
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Project must be approved to be claimable
  if (project.status !== 'approved') {
    throw new ValidationError('This project is not available for claiming');
  }

  // Project must not already have an owner
  if (project.userId !== null) {
    throw new ValidationError('This project already has an owner');
  }

  // User cannot claim a project they already own (shouldn't happen, but defensive check)
  if (project.userId === user.id) {
    throw new ValidationError('You already own this project');
  }

  // Check if user already has a claim for this project
  const existingClaim = await prisma.projectClaim.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (existingClaim) {
    if (existingClaim.status === 'pending') {
      throw new ValidationError('You already have a pending claim for this project');
    }
    if (existingClaim.status === 'approved') {
      throw new ValidationError('You have already successfully claimed this project');
    }
    // If rejected, allow re-submission (user can try again)
  }

  // Create the claim
  const claim = await prisma.projectClaim.create({
    data: {
      projectId,
      userId: user.id,
      status: 'pending',
      proofOfOwnership: input.proofOfOwnership || null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return claim;
}

/**
 * Get claim status for a user and project
 */
export async function getClaimStatus(userId: string, projectId: string) {
  const claim = await prisma.projectClaim.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      proofOfOwnership: true,
      rejectionReason: true,
      createdAt: true,
      moderatedAt: true,
    },
  });

  return claim;
}

/**
 * List claims (admin only)
 */
export async function listClaims(query: ClaimListQuery) {
  const { page, limit, status, projectId, userId } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (projectId) where.projectId = projectId;
  if (userId) where.userId = userId;

  const [claims, total] = await Promise.all([
    prisma.projectClaim.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.projectClaim.count({ where }),
  ]);

  return {
    data: claims,
    meta: {
      page,
      limit,
      total,
    },
  };
}

/**
 * Approve a claim (admin only)
 */
export async function approveClaim(
  admin: AuthenticatedUser,
  claimId: string,
  input: ApproveClaimInput
) {
  const claim = await prisma.projectClaim.findUnique({
    where: { id: claimId },
    include: {
      project: {
        select: {
          id: true,
          userId: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!claim) {
    throw new NotFoundError('Claim not found');
  }

  if (claim.status !== 'pending') {
    throw new ValidationError(`Cannot approve claim with status: ${claim.status}`);
  }

  // Check if project already has an owner (race condition check)
  if (claim.project.userId !== null) {
    throw new ValidationError('Project already has an owner');
  }

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update the claim
    const updatedClaim = await tx.projectClaim.update({
      where: { id: claimId },
      data: {
        status: 'approved',
        moderatedBy: admin.id,
        moderatedAt: new Date(),
      },
    });

    // Transfer project ownership
    await tx.project.update({
      where: { id: claim.projectId },
      data: {
        userId: claim.userId,
      },
    });

    // Reject all other pending claims for this project
    await tx.projectClaim.updateMany({
      where: {
        projectId: claim.projectId,
        status: 'pending',
        id: { not: claimId },
      },
      data: {
        status: 'rejected',
        moderatedBy: admin.id,
        moderatedAt: new Date(),
        rejectionReason: 'Another claim for this project was approved',
      },
    });

    return updatedClaim;
  });

  return result;
}

/**
 * Reject a claim (admin only)
 */
export async function rejectClaim(
  admin: AuthenticatedUser,
  claimId: string,
  input: RejectClaimInput
) {
  const claim = await prisma.projectClaim.findUnique({
    where: { id: claimId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!claim) {
    throw new NotFoundError('Claim not found');
  }

  if (claim.status !== 'pending') {
    throw new ValidationError(`Cannot reject claim with status: ${claim.status}`);
  }

  const updatedClaim = await prisma.projectClaim.update({
    where: { id: claimId },
    data: {
      status: 'rejected',
      moderatedBy: admin.id,
      moderatedAt: new Date(),
      rejectionReason: input.reason,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedClaim;
}

/**
 * Revoke an approved claim (admin only)
 * Removes project ownership and marks the claim as rejected.
 */
export async function revokeClaim(
  admin: AuthenticatedUser,
  claimId: string,
  input: RevokeClaimInput
) {
  const claim = await prisma.projectClaim.findUnique({
    where: { id: claimId },
    include: {
      project: {
        select: {
          id: true,
          userId: true,
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!claim) {
    throw new NotFoundError('Claim not found');
  }

  if (claim.status !== 'approved') {
    throw new ValidationError(`Cannot revoke claim with status: ${claim.status}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedClaim = await tx.projectClaim.update({
      where: { id: claimId },
      data: {
        status: 'rejected',
        moderatedBy: admin.id,
        moderatedAt: new Date(),
        rejectionReason: input.reason?.trim() || 'Ownership revoked by administrator',
      },
    });

    await tx.project.update({
      where: { id: claim.projectId },
      data: { userId: null },
    });

    return updatedClaim;
  });

  return {
    ...result,
    project: claim.project,
    user: claim.user,
  };
}

/**
 * Get claim by ID (admin only)
 */
export async function getClaimById(claimId: string) {
  const claim = await prisma.projectClaim.findUnique({
    where: { id: claimId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
          userId: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!claim) {
    throw new NotFoundError('Claim not found');
  }

  return claim;
}