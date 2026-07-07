import { prisma } from '@/lib/db';
import { AuditAction, Prisma } from '@prisma/client';
import {
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_TEMPLATES_BY_KEY,
  buildDefaultHtmlBody,
  type TemplateVariableDef,
} from '@/lib/email/default-templates';
import {
  getCommonEmailVariables,
  getSampleVariables,
  isUnchangedFromDefault,
  sanitizeEmailHtml,
  substituteTemplate,
  validateTemplateContent,
} from '@/lib/email/template-engine';

export interface RenderedEmail {
  subject: string;
  html: string;
  isActive: boolean;
  source: 'database' | 'fallback';
}

function getRequiredVariableNames(variables: unknown): string[] {
  if (!Array.isArray(variables)) return [];
  return (variables as TemplateVariableDef[])
    .filter((v) => v.required)
    .map((v) => v.name);
}

export async function renderEmailTemplate(
  key: string,
  variables: Record<string, string>
): Promise<RenderedEmail> {
  const mergedVars = { ...getCommonEmailVariables(), ...variables };

  const dbTemplate = await prisma.emailTemplate.findUnique({ where: { key } });

  if (dbTemplate) {
    return {
      subject: substituteTemplate(dbTemplate.subject, mergedVars),
      html: sanitizeEmailHtml(substituteTemplate(dbTemplate.htmlBody, mergedVars)),
      isActive: dbTemplate.isActive,
      source: 'database',
    };
  }

  const fallback = DEFAULT_TEMPLATES_BY_KEY[key];
  if (!fallback) {
    throw new Error(`Unknown email template key: ${key}`);
  }

  const htmlBody = buildDefaultHtmlBody(fallback);
  return {
    subject: substituteTemplate(fallback.subject, mergedVars),
    html: sanitizeEmailHtml(substituteTemplate(htmlBody, mergedVars)),
    isActive: true,
    source: 'fallback',
  };
}

export async function listEmailTemplates(search?: string) {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const filtered = search
    ? templates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.key.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  return filtered.map((t) => ({
    ...t,
    isDefaultContent: isUnchangedFromDefault(t.key, t.subject, t.htmlBody),
  }));
}

export async function getEmailTemplateById(id: string) {
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) return null;

  return {
    ...template,
    isDefaultContent: isUnchangedFromDefault(template.key, template.subject, template.htmlBody),
  };
}

export async function updateEmailTemplate(
  id: string,
  data: { subject?: string; htmlBody?: string; isActive?: boolean },
  userId: string
) {
  const existing = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!existing) return null;

  const subject = data.subject ?? existing.subject;
  const htmlBody = data.htmlBody ?? existing.htmlBody;
  const sanitizedHtml = sanitizeEmailHtml(htmlBody);

  const validation = validateTemplateContent(
    subject,
    sanitizedHtml,
    getRequiredVariableNames(existing.variables)
  );

  if (!validation.valid) {
    throw new Error(
      `Template is missing required variables: ${validation.missing.join(', ')}`
    );
  }

  const updated = await prisma.emailTemplate.update({
    where: { id },
    data: {
      ...(data.subject !== undefined && { subject }),
      ...(data.htmlBody !== undefined && { htmlBody: sanitizedHtml }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.update,
      resourceType: 'email_template',
      resourceId: updated.id,
      details: {
        key: updated.key,
        changes: {
          ...(data.subject !== undefined && { subject: { from: existing.subject, to: subject } }),
          ...(data.htmlBody !== undefined && { htmlBody: 'updated' }),
          ...(data.isActive !== undefined && {
            isActive: { from: existing.isActive, to: data.isActive },
          }),
        },
      },
    },
  });

  return {
    ...updated,
    isDefaultContent: isUnchangedFromDefault(updated.key, updated.subject, updated.htmlBody),
  };
}

export async function previewEmailTemplate(id: string) {
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) return null;

  const sampleVars = getSampleVariables(template.key);
  const subject = substituteTemplate(template.subject, sampleVars);
  const html = sanitizeEmailHtml(substituteTemplate(template.htmlBody, sampleVars));

  return { subject, html, sampleVars };
}

export async function seedEmailTemplates() {
  for (const def of DEFAULT_EMAIL_TEMPLATES) {
    const htmlBody = buildDefaultHtmlBody(def);
    await prisma.emailTemplate.upsert({
      where: { key: def.key },
      update: {},
      create: {
        key: def.key,
        name: def.name,
        description: def.description,
        subject: def.subject,
        htmlBody,
        variables: def.variables as unknown as Prisma.InputJsonValue,
        category: def.category,
        isActive: true,
      },
    });
  }
}
