import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import {
  getEmailTemplateById,
  updateEmailTemplate,
} from '@/lib/services/email-template.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  subject: z.string().min(1).max(500).optional(),
  htmlBody: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const template = await getEmailTemplateById(id);

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(successResponse(template));
  } catch (error: unknown) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = updateSchema.parse(await req.json());

    const updated = await updateEmailTemplate(id, body, user.id);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(successResponse(updated));
  } catch (error: unknown) {
    console.error('Error updating email template:', error);
    const message = error instanceof Error ? error.message : 'Failed to update template';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
