import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { loginUser } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

/**
 * Login user
 * POST /api/auth/login
 */
export const POST = createPostHandler(
  async (req: NextRequest) => {
    const body = getValidatedBody<LoginInput>(req);
    const result = await loginUser(body);

    // Set refresh token as HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(successResponse(result));
  },
  loginSchema
);

