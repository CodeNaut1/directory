import { NextRequest, NextResponse } from 'next/server';
import { createPostHandler, getValidatedBody } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { registerUser } from '@/lib/services/auth.service';
import { sendWelcomeEmail } from '@/lib/services/email.service';
import { cookies } from 'next/headers';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const POST = createPostHandler(
  async (req: NextRequest) => {
    const body = getValidatedBody<RegisterInput>(req);
    const result = await registerUser(body);

    // Set refresh token as HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Send welcome email (non-blocking)
    setImmediate(async () => {
      try {
        await sendWelcomeEmail({
          userName: result.user.name || result.user.email.split('@')[0],
          userEmail: result.user.email,
        });
        console.log('✅ Welcome email sent to:', result.user.email);
      } catch (error) {
        console.error('⚠️ Failed to send welcome email:', error);
        // Don't fail registration if email fails
      }
    });

    return NextResponse.json(successResponse(result), { status: 201 });
  },
  registerSchema
);