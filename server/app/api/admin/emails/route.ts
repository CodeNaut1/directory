import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { listEmailTemplates } from '@/lib/services/email-template.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const search = req.nextUrl.searchParams.get('search') || undefined;
    const templates = await listEmailTemplates(search);

    return NextResponse.json(successResponse(templates));
  } catch (error: unknown) {
    console.error('Error listing email templates:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list templates' },
      { status: 500 }
    );
  }
}
