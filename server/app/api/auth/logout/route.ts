import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { cookies } from 'next/headers';

/**
 * Logout user
 * POST /api/auth/logout
 */
export const POST = createPostHandler(async (req: NextRequest) => {
  // Clear refresh token cookie
  const cookieStore = await cookies();
  cookieStore.delete('refreshToken');

  return NextResponse.json(
    successResponse({
      message: 'Logged out successfully',
    })
  );
});

