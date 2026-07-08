import { google } from 'googleapis';
import { renderEmailTemplate } from '@/lib/services/email-template.service';
import { getCommonEmailVariables } from '@/lib/email/template-engine';

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const FROM_EMAIL = process.env.GMAIL_DELEGATED_USER || 'hello@bitcoiners.africa';
const REPLY_TO_EMAIL = FROM_EMAIL;
const FRONTEND_URL =
  process.env.FRONTEND_URL || process.env.VITE_APP_URL || 'http://localhost:5173';

interface SendEmailOptions {
  bcc?: string | string[];
  replyTo?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface SubmissionEmailData {
  userName: string;
  userEmail: string;
  projectName: string;
  country: string;
  category: string;
  description: string;
  website?: string;
  submittedAt: string;
}

export interface ProjectActionEmailData {
  userName: string;
  userEmail: string;
  projectName: string;
  projectSlug: string;
}

export interface ChangesRequestedEmailData extends ProjectActionEmailData {
  feedback: string;
}

export interface ClaimEmailData {
  claimantName: string;
  claimantEmail: string;
  projectName: string;
  projectSlug: string;
}

function getPrivateKey(): string {
  const key = process.env.GMAIL_PRIVATE_KEY || '';
  return key.replace(/\\n/g, '\n');
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_SERVICE_ACCOUNT_EMAIL && process.env.GMAIL_PRIVATE_KEY);
}

function parseRecipients(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((entry) => entry.split(','))
    .map((email) => email.trim())
    .filter(Boolean);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMultiline(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, '<br />');
}

function projectUrl(slug: string): string {
  return `${FRONTEND_URL.replace(/\/$/, '')}/project/${slug}`;
}

function encodeSubject(subject: string): string {
  if (/^[\x00-\x7F]*$/.test(subject)) {
    return subject;
  }
  const encoded = Buffer.from(subject, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

function encodeMessage(message: string): string {
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getGmailClient() {
  const clientEmail = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL;
  const delegatedUser = process.env.GMAIL_DELEGATED_USER || 'hello@bitcoiners.africa';
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    throw new Error('Gmail service account credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GMAIL_SCOPES,
    subject: delegatedUser,
  });

  return google.gmail({ version: 'v1', auth });
}

function buildRawMessage(params: {
  to: string[];
  subject: string;
  html: string;
  bcc?: string[];
  replyTo?: string;
}): string {
  const from = `"African Bitcoin Directory" <${FROM_EMAIL}>`;
  const lines = [`From: ${from}`, `To: ${params.to.join(', ')}`];

  if (params.bcc?.length) {
    lines.push(`Bcc: ${params.bcc.join(', ')}`);
  }

  if (params.replyTo) {
    lines.push(`Reply-To: ${params.replyTo}`);
  }

  lines.push(`Subject: ${encodeSubject(params.subject)}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/html; charset=UTF-8');
  lines.push('Content-Transfer-Encoding: 7bit');
  lines.push('');
  lines.push(params.html);

  return lines.join('\r\n');
}

const getAdminEmails = (): string[] => {
  return process.env.ADMIN_EMAIL
    ? process.env.ADMIN_EMAIL.split(',').map((email) => email.trim())
    : [];
};

const getTeamEmails = (): string[] => {
  return process.env.TEAM_EMAIL
    ? process.env.TEAM_EMAIL.split(',').map((email) => email.trim())
    : [];
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options: SendEmailOptions = {}
): Promise<string | undefined> {
  const recipients = parseRecipients(to);
  if (recipients.length === 0) {
    throw new Error('At least one recipient is required');
  }

  const gmail = getGmailClient();
  const raw = buildRawMessage({
    to: recipients,
    subject,
    html,
    bcc: options.bcc ? parseRecipients(options.bcc) : [],
    replyTo: options.replyTo || REPLY_TO_EMAIL,
  });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodeMessage(raw) },
  });

  return response.data.id ?? undefined;
}

async function sendTemplatedEmail(
  templateKey: string,
  to: string | string[],
  subject: string,
  html: string,
  options: SendEmailOptions = {}
): Promise<void> {
  const recipients = parseRecipients(to);

  if (recipients.length === 0) {
    console.warn(`⚠️ [${templateKey}] skipped — no recipients configured`);
    return;
  }

  try {
    if (!isEmailConfigured()) {
      console.warn(`⚠️ [${templateKey}] skipped — Gmail API credentials not configured`);
      return;
    }

    const messageId = await sendEmail(to, subject, html, options);
    console.log(`✅ [${templateKey}] sent to ${recipients.join(', ')} | Message ID: ${messageId}`);
  } catch (error) {
    console.error(`❌ [${templateKey}] failed for ${recipients.join(', ')}:`, error);
  }
}

async function dispatchTemplateEmail(
  templateKey: string,
  to: string | string[],
  variables: Record<string, string>,
  options: SendEmailOptions = {}
): Promise<void> {
  try {
    const rendered = await renderEmailTemplate(templateKey, variables);

    if (!rendered.isActive) {
      console.warn(`⚠️ [${templateKey}] skipped — template is inactive`);
      return;
    }

    if (rendered.source === 'fallback') {
      console.warn(`⚠️ [${templateKey}] using hardcoded fallback template`);
    }

    await sendTemplatedEmail(templateKey, to, rendered.subject, rendered.html, options);
  } catch (error) {
    console.error(`❌ [${templateKey}] dispatch failed:`, error);
  }
}

export async function verifyEmailConnection() {
  try {
    if (!isEmailConfigured()) {
      console.warn('⚠️ Gmail API credentials not configured');
      return false;
    }

    const clientEmail = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL!;
    const privateKey = getPrivateKey();
    const delegatedUser = process.env.GMAIL_DELEGATED_USER || 'hello@bitcoiners.africa';

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: GMAIL_SCOPES,
      subject: delegatedUser,
    });

    await auth.authorize();
    console.log('✅ Email service is ready (Gmail API)');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
}

// Welcome email — not in DB admin templates; uses inline fallback
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const common = getCommonEmailVariables();
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#374151;padding:24px;">
    <p>Hi ${escapeHtml(data.userName)},</p>
    <p>Welcome to the African Bitcoin Directory — a curated map of the Bitcoin ecosystem across Africa.</p>
    <p><a href="${common.dashboardUrl}" style="color:#FD5A47;">Go to your dashboard</a></p>
    <p><strong>The African Bitcoiners Team</strong></p>
  </body></html>`;

  await sendTemplatedEmail(
    'welcome.user',
    data.userEmail,
    'Welcome to the African Bitcoin Directory',
    html
  );
}

export async function sendSubmissionConfirmationToUser(data: SubmissionEmailData) {
  await dispatchTemplateEmail('project_submission_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
    country: data.country,
    category: data.category,
    submittedAt: data.submittedAt,
  });
}

export async function sendNewSubmissionToTeam(data: SubmissionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_submission_team', teamEmails, {
    userName: data.userName,
    userEmail: data.userEmail,
    projectName: data.projectName,
    country: data.country,
    category: data.category,
    website: data.website || '—',
    description:
      data.description.length > 300
        ? `${data.description.slice(0, 300)}...`
        : data.description,
    submittedAt: data.submittedAt,
  });
}

export async function sendProjectUpdateToUser(data: SubmissionEmailData) {
  await dispatchTemplateEmail('project_update_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
    country: data.country,
    category: data.category,
    updatedAt: data.submittedAt,
  });
}

export async function sendProjectUpdateToTeam(data: SubmissionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_update_team', teamEmails, {
    userName: data.userName,
    userEmail: data.userEmail,
    projectName: data.projectName,
    country: data.country,
    category: data.category,
    website: data.website || '—',
    description:
      data.description.length > 300
        ? `${data.description.slice(0, 300)}...`
        : data.description,
    updatedAt: data.submittedAt,
  });
}

export async function sendProjectApprovedToUser(data: ProjectActionEmailData) {
  await dispatchTemplateEmail('project_approved_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendProjectApprovedToTeam(data: ProjectActionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_approved_team', teamEmails, {
    userName: data.userName,
    userEmail: data.userEmail,
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendProjectRejectedToUser(data: ProjectActionEmailData) {
  await dispatchTemplateEmail('project_rejected_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
  });
}

export async function sendProjectRejectedToTeam(data: ProjectActionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_rejected_team', teamEmails, {
    userName: data.userName,
    userEmail: data.userEmail,
    projectName: data.projectName,
  });
}

export async function sendChangesRequestedToUser(data: ChangesRequestedEmailData) {
  await dispatchTemplateEmail('project_changes_requested_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
    feedbackNotes: formatMultiline(data.feedback),
  });
}

export async function sendChangesRequestedToTeam(data: ChangesRequestedEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_changes_requested_team', teamEmails, {
    userName: data.userName,
    userEmail: data.userEmail,
    projectName: data.projectName,
    feedbackNotes: formatMultiline(data.feedback),
  });
}

export async function sendProjectUnpublishedToUser(data: ProjectActionEmailData) {
  await dispatchTemplateEmail('project_unpublished_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
  });
}

export async function sendProjectUnpublishedToTeam(data: ProjectActionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_unpublished_team', teamEmails, {
    userName: data.userName || 'None',
    userEmail: data.userEmail || '—',
    projectName: data.projectName,
  });
}

export async function sendProjectRepublishedToUser(data: ProjectActionEmailData) {
  await dispatchTemplateEmail('project_republished_user', data.userEmail, {
    userName: data.userName,
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendProjectRepublishedToTeam(data: ProjectActionEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('project_republished_team', teamEmails, {
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendClaimSubmittedToUser(data: ClaimEmailData) {
  await dispatchTemplateEmail('claim_submitted_user', data.claimantEmail, {
    claimantName: data.claimantName,
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendClaimSubmittedToAdmin(data: ClaimEmailData) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  await dispatchTemplateEmail('claim_submitted_admin', adminEmails, {
    claimantName: data.claimantName,
    claimantEmail: data.claimantEmail,
    projectName: data.projectName,
    projectUrl: projectUrl(data.projectSlug),
  });
}

export async function sendClaimApprovedToUser(data: ClaimEmailData) {
  await dispatchTemplateEmail('claim_approved_user', data.claimantEmail, {
    claimantName: data.claimantName,
    projectName: data.projectName,
  });
}

export async function sendClaimApprovedToTeam(data: ClaimEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('claim_approved_team', teamEmails, {
    claimantName: data.claimantName,
    claimantEmail: data.claimantEmail,
    projectName: data.projectName,
  });
}

export async function sendClaimRejectedToUser(data: ClaimEmailData) {
  await dispatchTemplateEmail('claim_rejected_user', data.claimantEmail, {
    claimantName: data.claimantName,
    projectName: data.projectName,
  });
}

export async function sendClaimRejectedToTeam(data: ClaimEmailData) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('claim_rejected_team', teamEmails, {
    claimantName: data.claimantName,
    claimantEmail: data.claimantEmail,
    projectName: data.projectName,
  });
}

function buildRevocationReasonBlock(reason?: string): Record<string, string> {
  const trimmed = reason?.trim();
  if (!trimmed) {
    return { revocationReason: '', revocationReasonBlock: '' };
  }

  const escaped = escapeHtml(trimmed);
  return {
    revocationReason: escaped,
    revocationReasonBlock: `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;"><strong>Reason:</strong> ${escaped}</p>`,
  };
}

export async function sendClaimRevokedToUser(data: ClaimEmailData, reason?: string) {
  await dispatchTemplateEmail('claim_revoked_user', data.claimantEmail, {
    claimantName: data.claimantName,
    projectName: data.projectName,
    ...buildRevocationReasonBlock(reason),
  });
}

export async function sendClaimRevokedToTeam(data: ClaimEmailData, reason?: string) {
  const teamEmails = getTeamEmails();
  if (teamEmails.length === 0) return;

  await dispatchTemplateEmail('claim_revoked_team', teamEmails, {
    claimantName: data.claimantName,
    claimantEmail: data.claimantEmail,
    projectName: data.projectName,
    ...buildRevocationReasonBlock(reason),
  });
}

export function buildProjectActionEmailData(project: {
  name: string;
  slug: string;
  user: { name: string | null; email: string } | null;
}): ProjectActionEmailData | null {
  if (!project.user?.email) return null;

  return {
    userName: project.user.name || project.user.email.split('@')[0],
    userEmail: project.user.email,
    projectName: project.name,
    projectSlug: project.slug,
  };
}

export function buildClaimEmailData(claim: {
  user: { name: string | null; email: string };
  project: { name: string; slug: string };
}): ClaimEmailData {
  return {
    claimantName: claim.user.name || claim.user.email.split('@')[0],
    claimantEmail: claim.user.email,
    projectName: claim.project.name,
    projectSlug: claim.project.slug,
  };
}
