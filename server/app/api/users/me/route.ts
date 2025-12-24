import { NextRequest, NextResponse } from 'next/server';
import { createGetHandler, createPatchHandler, getValidatedBody, getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { updateUserSchema, type UpdateUserInput } from '@/lib/validators';
import { getUserById, updateUser } from '@/lib/services/user.service';

/**
 * Get current user
 * GET /api/users/me
 */
export const GET = createGetHandler(
  async (req: NextRequest) => {
    const user = getRequestUser(req);
    const userData = await getUserById(user.id);

    return NextResponse.json(successResponse(userData));
  },
  { requireAuth: true }
);

/**
 * Update current user
 * PATCH /api/users/me
 */
export const PATCH = createPatchHandler(
  async (req: NextRequest) => {
    const user = getRequestUser(req);
    const body = getValidatedBody<UpdateUserInput>(req);
    const updatedUser = await updateUser(user.id, body);

    return NextResponse.json(successResponse(updatedUser));
  },
  updateUserSchema,
  { requireAuth: true }
);

