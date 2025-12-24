import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { AuthenticationError } from '@/lib/utils/errors';

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const POST = createPostHandler(async (req: NextRequest) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token not found');
  }

  try {
    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = await generateAccessToken({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    });

    return NextResponse.json(
      successResponse({
        accessToken,
      })
    );
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
});

