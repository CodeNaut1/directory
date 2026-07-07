import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/utils/api-response';
import { prisma } from '@/lib/db';
import { getSampleVariables, substituteTemplate, sanitizeEmailHtml } from '@/lib/email/template-engine';
import { sendEmail } from '@/lib/services/email.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    const template = await prisma.emailTemplate.findUnique({ where: { id } });

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const sampleVars = getSampleVariables(template.key);
    const subject = substituteTemplate(template.subject, sampleVars);
    const html = sanitizeEmailHtml(substituteTemplate(template.htmlBody, sampleVars));

    const messageId = await sendEmail(user.email, `[TEST] ${subject}`, html);

    return NextResponse.json(
      successResponse({
        message: `Test email sent to ${user.email}`,
        messageId,
      })
    );
  } catch (error: unknown) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
