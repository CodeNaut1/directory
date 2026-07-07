import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { previewEmailTemplate } from '@/lib/services/email-template.service';
import { getSampleVariables, sanitizeEmailHtml, substituteTemplate } from '@/lib/email/template-engine';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const previewSchema = z.object({
  subject: z.string().optional(),
  htmlBody: z.string().optional(),
});

export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = previewSchema.parse(await req.json().catch(() => ({})));

    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    if (body.subject || body.htmlBody) {
      const sampleVars = getSampleVariables(template.key);
      const subject = substituteTemplate(body.subject || template.subject, sampleVars);
      const html = sanitizeEmailHtml(
        substituteTemplate(body.htmlBody || template.htmlBody, sampleVars)
      );

      return NextResponse.json(
        successResponse({ subject, html, sampleVars })
      );
    }

    const preview = await previewEmailTemplate(id);
    if (!preview) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(successResponse(preview));
  } catch (error: unknown) {
    console.error('Error previewing email template:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to preview template' },
      { status: 500 }
    );
  }
}
