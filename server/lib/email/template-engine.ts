import { DEFAULT_TEMPLATES_BY_KEY, buildDefaultHtmlBody } from '@/lib/email/default-templates';

const FRONTEND_URL =
  process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'http://localhost:5173';

export const EMAIL_LOGO_URL =
  process.env.EMAIL_LOGO_URL ||
  'https://pub-d2aef463d8a6497d90ac252cbcb0dcbf.r2.dev/African-Bitcoiners-official_logo.png';

export function getCommonEmailVariables(): Record<string, string> {
  const base = FRONTEND_URL.replace(/\/$/, '');
  return {
    siteName: 'African Bitcoin Directory',
    frontendUrl: base,
    logoUrl: EMAIL_LOGO_URL,
    contactEmail: 'hello@bitcoiners.africa',
    dashboardUrl: `${base}/dashboard`,
    adminPendingUrl: `${base}/admin/projects/pending`,
    adminClaimsUrl: `${base}/admin/claims`,
  };
}

export function substituteTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? '');
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

export function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

export function validateTemplateContent(
  subject: string,
  htmlBody: string,
  requiredVariables: string[]
): { valid: boolean; missing: string[] } {
  const used = new Set([
    ...extractTemplateVariables(subject),
    ...extractTemplateVariables(htmlBody),
  ]);

  const missing = requiredVariables.filter((v) => !used.has(v));
  return { valid: missing.length === 0, missing };
}

export function isUnchangedFromDefault(
  key: string,
  subject: string,
  htmlBody: string
): boolean {
  const def = DEFAULT_TEMPLATES_BY_KEY[key];
  if (!def) return false;
  const defaultHtml = buildDefaultHtmlBody(def);
  return subject.trim() === def.subject.trim() && htmlBody.trim() === defaultHtml.trim();
}

/** True when DB still has an old seeded layout (large centered logo) that predates the compact header. */
export function isStaleSeededTemplate(htmlBody: string): boolean {
  const hasLegacyLargeLogo =
    htmlBody.includes('width="180"') || htmlBody.includes('width="200"');
  const hasCompactHeader = htmlBody.includes('width="44"');
  return hasLegacyLargeLogo && !hasCompactHeader;
}

export function shouldSyncTemplateFromDefaults(
  key: string,
  subject: string,
  htmlBody: string
): boolean {
  return (
    isUnchangedFromDefault(key, subject, htmlBody) ||
    isStaleSeededTemplate(htmlBody)
  );
}

export const SAMPLE_EMAIL_VARIABLES: Record<string, Record<string, string>> = {
  project_submission_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
    country: 'Nigeria',
    category: 'Community',
    submittedAt: 'Jul 7, 2026, 10:30 AM',
  },
  project_submission_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
    country: 'Nigeria',
    category: 'Community',
    website: 'https://example.com',
    description: 'A community hub promoting Bitcoin adoption in Lagos.',
    submittedAt: 'Jul 7, 2026, 10:30 AM',
  },
  project_approved_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  project_approved_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  project_rejected_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
  },
  project_rejected_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
  },
  project_changes_requested_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
    feedbackNotes: 'Please add your website URL and a clearer project description.',
  },
  project_changes_requested_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
    feedbackNotes: 'Please add your website URL and a clearer project description.',
  },
  project_unpublished_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
  },
  project_unpublished_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
  },
  project_republished_user: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  project_republished_team: {
    ...getCommonEmailVariables(),
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  claim_submitted_user: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  claim_submitted_admin: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    claimantEmail: 'john@example.com',
    projectName: 'Bitcoin Lagos Hub',
    projectUrl: `${FRONTEND_URL.replace(/\/$/, '')}/project/bitcoin-lagos-hub`,
  },
  claim_approved_user: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    projectName: 'Bitcoin Lagos Hub',
  },
  claim_approved_team: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    claimantEmail: 'john@example.com',
    projectName: 'Bitcoin Lagos Hub',
  },
  claim_rejected_user: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    projectName: 'Bitcoin Lagos Hub',
  },
  claim_rejected_team: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    claimantEmail: 'john@example.com',
    projectName: 'Bitcoin Lagos Hub',
  },
  claim_revoked_user: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    projectName: 'Bitcoin Lagos Hub',
    revocationReason: 'Insufficient verification of ownership.',
    revocationReasonBlock:
      '<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;"><strong>Reason:</strong> Insufficient verification of ownership.</p>',
  },
  claim_revoked_team: {
    ...getCommonEmailVariables(),
    claimantName: 'John Smith',
    claimantEmail: 'john@example.com',
    projectName: 'Bitcoin Lagos Hub',
    revocationReason: 'Insufficient verification of ownership.',
    revocationReasonBlock:
      '<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;"><strong>Reason:</strong> Insufficient verification of ownership.</p>',
  },
};

export function getSampleVariables(key: string): Record<string, string> {
  return SAMPLE_EMAIL_VARIABLES[key] || getCommonEmailVariables();
}
