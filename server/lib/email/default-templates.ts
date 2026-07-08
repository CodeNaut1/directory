import { EmailTemplateCategory } from '@prisma/client';

export interface TemplateVariableDef {
  name: string;
  description: string;
  required: boolean;
}

export interface DefaultEmailTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  category: EmailTemplateCategory;
  variables: TemplateVariableDef[];
  bodyContent: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const COMMON_VARS: TemplateVariableDef[] = [
  { name: 'siteName', description: 'Directory site name', required: true },
  { name: 'frontendUrl', description: 'Public site URL', required: true },
  { name: 'logoUrl', description: 'Logo image URL', required: true },
  { name: 'contactEmail', description: 'Contact email address', required: true },
];

export function wrapEmailLayout(params: {
  title: string;
  preheader: string;
  bodyContent: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const ctaBlock =
    params.ctaLabel && params.ctaHref
      ? `<tr>
        <td style="padding: 0 32px 32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius: 6px; background-color: #FD5A47;">
                <a href="${params.ctaHref}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">${params.ctaLabel}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${params.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F4F6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB;">
          <tr>
            <td style="padding: 28px 32px 20px; text-align: center; border-bottom: 3px solid #FD5A47;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding-right: 10px; vertical-align: middle;">
                    <img src="{{logoUrl}}" alt="African Bitcoiners" width="44" style="display: block; width: 44px; max-width: 44px; height: auto; border-radius: 50%;" />
                  </td>
                  <td style="vertical-align: middle; font-family: Arial, Helvetica, sans-serif; font-size: 17px; font-weight: 700; color: #111827; letter-spacing: -0.01em; white-space: nowrap;">
                    African Bitcoiners
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 8px; font-family: Arial, Helvetica, sans-serif;">
              <h1 style="margin: 0 0 20px; font-size: 22px; line-height: 1.3; font-weight: 700; color: #111827;">${params.title}</h1>
              ${params.bodyContent}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding: 24px 32px 32px; border-top: 1px solid #E5E7EB; background-color: #F9FAFB;">
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: #6B7280; text-align: center;">
                <a href="{{frontendUrl}}" style="color: #FD5A47; text-decoration: none; font-weight: 600;">{{siteName}}</a>
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9CA3AF; text-align: center;">
                Questions? Reply to this email or contact us at
                <a href="mailto:{{contactEmail}}" style="color: #6B7280; text-decoration: underline;">{{contactEmail}}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function p(text: string) {
  return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #374151;">${text}</p>`;
}

function infoBox(inner: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="padding: 16px 20px; background-color: #F9FAFB; border-left: 4px solid #FD5A47; border-radius: 0 6px 6px 0; font-size: 15px; line-height: 1.6; color: #374151;">${inner}</td></tr></table>`;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    key: 'project_submission_user',
    name: 'Project Submission - User',
    description: 'Sent to the submitter when a new project is submitted for review.',
    category: 'submission',
    subject: 'Your project submission to African Bitcoin Directory',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "The submitter's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'country', description: 'Project country', required: true },
      { name: 'category', description: 'Project category', required: true },
      { name: 'submittedAt', description: 'Submission timestamp', required: true },
      { name: 'dashboardUrl', description: 'Link to user dashboard', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('Thank you for submitting <strong>{{projectName}}</strong> to the African Bitcoin Directory. We appreciate you taking the time to share your work with the community.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0 0 8px;"><strong>Country:</strong> {{country}}</p>
        <p style="margin: 0 0 8px;"><strong>Category:</strong> {{category}}</p>
        <p style="margin: 0;"><strong>Submitted:</strong> {{submittedAt}}</p>
      `)}
      ${p('Our team will review your submission carefully. Reviews typically take up to <strong>two weeks</strong>. You will receive an email once your project has been approved, if we need changes, or if it does not fit our directory scope.')}
      ${p('You can track your submission status anytime from your dashboard.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'View Dashboard',
    ctaHref: '{{dashboardUrl}}',
  },
  {
    key: 'project_submission_team',
    name: 'Project Submission - Team',
    description: 'Sent to TEAM_EMAIL when a new project is submitted.',
    category: 'submission',
    subject: 'New project submission: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'country', description: 'Project country', required: true },
      { name: 'category', description: 'Project category', required: true },
      { name: 'userName', description: "Submitter's name", required: true },
      { name: 'userEmail', description: "Submitter's email", required: true },
      { name: 'website', description: 'Project website (may be empty)', required: false },
      { name: 'description', description: 'Short project description', required: true },
      { name: 'submittedAt', description: 'Submission timestamp', required: true },
      { name: 'adminPendingUrl', description: 'Admin pending review URL', required: true },
    ],
    bodyContent: `
      ${p('A new project has been submitted and is awaiting review.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0 0 8px;"><strong>Country:</strong> {{country}}</p>
        <p style="margin: 0 0 8px;"><strong>Category:</strong> {{category}}</p>
        <p style="margin: 0 0 8px;"><strong>Submitter:</strong> {{userName}} ({{userEmail}})</p>
        <p style="margin: 0 0 8px;"><strong>Website:</strong> {{website}}</p>
        <p style="margin: 0 0 8px;"><strong>Description:</strong> {{description}}</p>
        <p style="margin: 0;"><strong>Submitted:</strong> {{submittedAt}}</p>
      `)}
    `,
    ctaLabel: 'Review Submission',
    ctaHref: '{{adminPendingUrl}}',
  },
  {
    key: 'project_approved_user',
    name: 'Project Approved - User',
    description: 'Sent to the project owner when an admin approves their submission.',
    category: 'approval',
    subject: 'Your project is now live on the African Bitcoin Directory',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "Owner's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('Congratulations — <strong>{{projectName}}</strong> is now live on the African Bitcoin Directory.')}
      ${p('Your listing is visible in the directory and can be discovered by country, category, and search. Share your project page with your community and keep your details up to date from your dashboard.')}
      ${infoBox('<p style="margin: 0;"><strong>About the infographic:</strong> Visual updates to our ecosystem infographic are published quarterly. Your project will be added to the next quarterly edition — we do not update the infographic with every individual approval.</p>')}
      ${p('Thank you for building with Bitcoin in Africa.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'View Your Project',
    ctaHref: '{{projectUrl}}',
  },
  {
    key: 'project_approved_team',
    name: 'Project Approved - Team',
    description: 'Sent to TEAM_EMAIL when a project is approved.',
    category: 'approval',
    subject: 'Project approved: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'userName', description: "Owner's name", required: true },
      { name: 'userEmail', description: "Owner's email", required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
    ],
    bodyContent: `
      ${p('<strong>{{projectName}}</strong> has been approved and is now live in the directory.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0 0 8px;"><strong>Owner:</strong> {{userName}} ({{userEmail}})</p>
        <p style="margin: 0;"><strong>Project page:</strong> <a href="{{projectUrl}}" style="color: #FD5A47;">{{projectUrl}}</a></p>
      `)}
    `,
  },
  {
    key: 'project_rejected_user',
    name: 'Project Rejected - User',
    description: 'Sent to the submitter when a project is rejected.',
    category: 'rejection',
    subject: 'Update on your project submission',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "Submitter's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('Thank you for submitting <strong>{{projectName}}</strong> to the African Bitcoin Directory. We genuinely appreciate your interest in being part of this community.')}
      ${p('After reviewing your submission, we are unable to include it in the directory at this time. The African Bitcoin Directory focuses specifically on Bitcoin-related projects with a connection to Africa — we curate carefully to keep the directory useful and accurate for the community.')}
      ${p('This is not a reflection on the value of your work. If you believe your project aligns with our scope, you are welcome to reach out with questions or submit again when the fit is clearer. We are always happy to hear from builders across the continent.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
  },
  {
    key: 'project_rejected_team',
    name: 'Project Rejected - Team',
    description: 'Sent to TEAM_EMAIL when a project is rejected.',
    category: 'rejection',
    subject: 'Project rejected: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'userName', description: "Submitter's name", required: true },
      { name: 'userEmail', description: "Submitter's email", required: true },
    ],
    bodyContent: `
      ${p('<strong>{{projectName}}</strong> has been rejected.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0;"><strong>Submitter:</strong> {{userName}} ({{userEmail}})</p>
      `)}
    `,
  },
  {
    key: 'project_changes_requested_user',
    name: 'Changes Requested - User',
    description: 'Sent to the submitter when an admin requests changes with feedback notes.',
    category: 'changes',
    subject: 'Feedback on your project submission',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "Submitter's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'feedbackNotes', description: 'Admin feedback (HTML formatted)', required: true },
      { name: 'dashboardUrl', description: 'Link to user dashboard', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('Thank you for submitting <strong>{{projectName}}</strong>. Our team has reviewed it and would like to request a few updates before we can approve it for the directory.')}
      ${infoBox(`
        <p style="margin: 0 0 8px; font-weight: 600; color: #111827;">Feedback from our team:</p>
        <p style="margin: 0;">{{feedbackNotes}}</p>
      `)}
      ${p('Please update your project based on the feedback above and resubmit from your dashboard. If anything is unclear, reply to this email and we will be happy to help.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'Update & Resubmit',
    ctaHref: '{{dashboardUrl}}',
  },
  {
    key: 'project_changes_requested_team',
    name: 'Changes Requested - Team',
    description: 'Sent to TEAM_EMAIL when changes are requested on a project.',
    category: 'changes',
    subject: 'Changes requested: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'userName', description: "Submitter's name", required: true },
      { name: 'userEmail', description: "Submitter's email", required: true },
      { name: 'feedbackNotes', description: 'Admin feedback (HTML formatted)', required: true },
    ],
    bodyContent: `
      ${p('Changes were requested for <strong>{{projectName}}</strong>.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0 0 8px;"><strong>Submitter:</strong> {{userName}} ({{userEmail}})</p>
        <p style="margin: 0;"><strong>Feedback sent:</strong> {{feedbackNotes}}</p>
      `)}
    `,
  },
  {
    key: 'project_unpublished_user',
    name: 'Project Unpublished - User',
    description: 'Sent to the project owner when an admin unpublishes their project.',
    category: 'other',
    subject: 'Your project has been temporarily unpublished',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "Owner's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'dashboardUrl', description: 'Link to user dashboard', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('We are writing to let you know that <strong>{{projectName}}</strong> has been temporarily taken down from the African Bitcoin Directory.')}
      ${p('This is not a rejection — your project has simply been unpublished and is no longer visible to the public. This may happen while we review an update, resolve a listing issue, or make administrative changes.')}
      ${p('If you have questions or would like to discuss next steps, please reply to this email or update your project details from your dashboard. We are here to help.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'Go to Dashboard',
    ctaHref: '{{dashboardUrl}}',
  },
  {
    key: 'project_unpublished_team',
    name: 'Project Unpublished - Team',
    description: 'Sent to TEAM_EMAIL when a project is unpublished.',
    category: 'other',
    subject: 'Project unpublished: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'userName', description: "Owner's name (or None)", required: false },
      { name: 'userEmail', description: "Owner's email (may be empty)", required: false },
    ],
    bodyContent: `
      ${p('<strong>{{projectName}}</strong> has been unpublished.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0;"><strong>Owner:</strong> {{userName}} ({{userEmail}})</p>
      `)}
    `,
  },
  {
    key: 'project_republished_user',
    name: 'Project Republished - User',
    description: 'Sent to the project owner when an admin republishes their project.',
    category: 'other',
    subject: 'Your project is back online on the African Bitcoin Directory',
    variables: [
      ...COMMON_VARS,
      { name: 'userName', description: "Owner's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
    ],
    bodyContent: `
      ${p('Hi {{userName}},')}
      ${p('Good news — <strong>{{projectName}}</strong> is back online and visible in the African Bitcoin Directory.')}
      ${p('Your listing is publicly accessible again. Feel free to share your project page and keep your details current from your dashboard.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'View Your Project',
    ctaHref: '{{projectUrl}}',
  },
  {
    key: 'project_republished_team',
    name: 'Project Republished - Team',
    description: 'Sent to TEAM_EMAIL when a project is republished.',
    category: 'other',
    subject: 'Project republished: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
    ],
    bodyContent: `
      ${p('<strong>{{projectName}}</strong> has been republished and is live in the directory.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0;"><strong>Project page:</strong> <a href="{{projectUrl}}" style="color: #FD5A47;">{{projectUrl}}</a></p>
      `)}
    `,
  },
  {
    key: 'claim_submitted_user',
    name: 'Claim Submitted - User',
    description: 'Sent to the claimant when an ownership claim is submitted.',
    category: 'ownership',
    subject: 'Your ownership claim has been received',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
    ],
    bodyContent: `
      ${p('Hi {{claimantName}},')}
      ${p('Thank you for submitting an ownership claim for <strong>{{projectName}}</strong>. Our team will review your request and get back to you within two business days.')}
      ${p('If we need any additional information, we will reach out by email.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'View Project',
    ctaHref: '{{projectUrl}}',
  },
  {
    key: 'claim_submitted_admin',
    name: 'Claim Submitted - Admin',
    description: 'Sent to ADMIN_EMAIL when a new ownership claim is submitted.',
    category: 'ownership',
    subject: 'New ownership claim: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's name", required: true },
      { name: 'claimantEmail', description: "Claimant's email", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'projectUrl', description: 'Public project page URL', required: true },
      { name: 'adminClaimsUrl', description: 'Admin claims review URL', required: true },
    ],
    bodyContent: `
      ${p('A new ownership claim requires review.')}
      ${infoBox(`
        <p style="margin: 0 0 8px;"><strong>Project:</strong> {{projectName}}</p>
        <p style="margin: 0 0 8px;"><strong>Claimant:</strong> {{claimantName}} ({{claimantEmail}})</p>
        <p style="margin: 0;"><strong>Project page:</strong> <a href="{{projectUrl}}" style="color: #FD5A47;">{{projectUrl}}</a></p>
      `)}
    `,
    ctaLabel: 'Review Claims',
    ctaHref: '{{adminClaimsUrl}}',
  },
  {
    key: 'claim_approved_user',
    name: 'Claim Approved - User',
    description: 'Sent to the claimant when their ownership claim is approved.',
    category: 'ownership',
    subject: 'Your ownership claim was approved',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'dashboardUrl', description: 'Link to user dashboard', required: true },
    ],
    bodyContent: `
      ${p('Hi {{claimantName}},')}
      ${p('Your ownership claim for <strong>{{projectName}}</strong> has been approved. You are now the listed owner of this project in the African Bitcoin Directory.')}
      ${p('You can update your project details, manage your listing, and track its status from your dashboard.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
    ctaLabel: 'Manage Project',
    ctaHref: '{{dashboardUrl}}',
  },
  {
    key: 'claim_approved_team',
    name: 'Claim Approved - Team',
    description: 'Sent to TEAM_EMAIL when an ownership claim is approved.',
    category: 'ownership',
    subject: 'Ownership claim approved: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's name", required: true },
      { name: 'claimantEmail', description: "Claimant's email", required: true },
      { name: 'projectName', description: 'Project name', required: true },
    ],
    bodyContent: `
      ${p('Ownership of <strong>{{projectName}}</strong> has been transferred to {{claimantName}} ({{claimantEmail}}).')}
    `,
  },
  {
    key: 'claim_rejected_user',
    name: 'Claim Rejected - User',
    description: 'Sent to the claimant when their ownership claim is rejected.',
    category: 'ownership',
    subject: 'Update on your ownership claim',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
    ],
    bodyContent: `
      ${p('Hi {{claimantName}},')}
      ${p('Thank you for submitting an ownership claim for <strong>{{projectName}}</strong>. We appreciate your interest in managing this listing.')}
      ${p('After reviewing your claim, we were unable to approve it at this time. Ownership claims are verified carefully to ensure listings accurately represent the people and teams behind each project.')}
      ${p('If you believe this was an error, or if your relationship to the project has changed, you are welcome to reach out with questions or submit a new claim. We are happy to help.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
  },
  {
    key: 'claim_rejected_team',
    name: 'Claim Rejected - Team',
    description: 'Sent to TEAM_EMAIL when an ownership claim is rejected.',
    category: 'ownership',
    subject: 'Ownership claim rejected: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Claimant's name", required: true },
      { name: 'claimantEmail', description: "Claimant's email", required: true },
      { name: 'projectName', description: 'Project name', required: true },
    ],
    bodyContent: `
      ${p('The ownership claim from {{claimantName}} ({{claimantEmail}}) for <strong>{{projectName}}</strong> was rejected.')}
    `,
  },
  {
    key: 'claim_revoked_user',
    name: 'Claim Revoked - User',
    description: 'Sent to the former owner when an approved ownership claim is revoked.',
    category: 'ownership',
    subject: 'Your project ownership has been revoked',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Former owner's display name", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'revocationReason', description: 'Reason for revocation (may be empty)', required: false },
    ],
    bodyContent: `
      ${p('Hi {{claimantName}},')}
      ${p('Your ownership of <strong>{{projectName}}</strong> has been revoked.')}
      {{revocationReasonBlock}}
      ${p('If you have questions about this decision, please reply to this email and our team will be happy to help.')}
      ${p('<strong>The African Bitcoiners Team</strong>')}
    `,
  },
  {
    key: 'claim_revoked_team',
    name: 'Claim Revoked - Team',
    description: 'Sent to TEAM_EMAIL when an approved ownership claim is revoked.',
    category: 'ownership',
    subject: 'Ownership revoked: {{projectName}}',
    variables: [
      ...COMMON_VARS,
      { name: 'claimantName', description: "Former owner's name", required: true },
      { name: 'claimantEmail', description: "Former owner's email", required: true },
      { name: 'projectName', description: 'Project name', required: true },
      { name: 'revocationReason', description: 'Reason for revocation (may be empty)', required: false },
    ],
    bodyContent: `
      ${p('Ownership of <strong>{{projectName}}</strong> was revoked from {{claimantName}} ({{claimantEmail}}).')}
      {{revocationReasonBlock}}
    `,
  },
];

export function buildDefaultHtmlBody(template: DefaultEmailTemplate): string {
  const titles: Record<string, string> = {
    project_submission_user: 'Thank you for your submission',
    project_submission_team: 'New project submission',
    project_approved_user: 'Your project is now live',
    project_approved_team: 'Project approved',
    project_rejected_user: 'Update on your project submission',
    project_rejected_team: 'Project rejected',
    project_changes_requested_user: 'Feedback on your project submission',
    project_changes_requested_team: 'Changes requested',
    project_unpublished_user: 'Your project has been temporarily unpublished',
    project_unpublished_team: 'Project unpublished',
    project_republished_user: 'Your project is back online',
    project_republished_team: 'Project republished',
    claim_submitted_user: 'Ownership claim received',
    claim_submitted_admin: 'New ownership claim',
    claim_approved_user: 'Your ownership claim was approved',
    claim_approved_team: 'Ownership claim approved',
    claim_rejected_user: 'Update on your ownership claim',
    claim_rejected_team: 'Ownership claim rejected',
    claim_revoked_user: 'Your project ownership has been revoked',
    claim_revoked_team: 'Ownership revoked',
  };

  const preheaders: Record<string, string> = {
    project_submission_user: 'We received your project: {{projectName}}',
    project_submission_team: '{{projectName}} submitted by {{userEmail}}',
    project_approved_user: '{{projectName}} has been approved',
    project_approved_team: '{{projectName}} is now live',
    project_rejected_user: 'An update regarding {{projectName}}',
    project_rejected_team: '{{projectName}} was not approved',
    project_changes_requested_user: 'We have feedback on {{projectName}}',
    project_changes_requested_team: 'Feedback sent for {{projectName}}',
    project_unpublished_user: '{{projectName}} is no longer visible in the directory',
    project_unpublished_team: '{{projectName}} was taken down',
    project_republished_user: '{{projectName}} is live again',
    project_republished_team: '{{projectName}} is live again',
    claim_submitted_user: 'We received your claim for {{projectName}}',
    claim_submitted_admin: '{{claimantEmail}} claimed {{projectName}}',
    claim_approved_user: 'You now own {{projectName}}',
    claim_approved_team: '{{claimantEmail}} now owns {{projectName}}',
    claim_rejected_user: 'An update regarding your claim for {{projectName}}',
    claim_rejected_team: 'Claim rejected for {{projectName}}',
    claim_revoked_user: 'Your ownership of {{projectName}} has been revoked',
    claim_revoked_team: 'Ownership revoked for {{projectName}}',
  };

  return wrapEmailLayout({
    title: titles[template.key] || template.name,
    preheader: preheaders[template.key] || template.name,
    bodyContent: template.bodyContent,
    ctaLabel: template.ctaLabel,
    ctaHref: template.ctaHref,
  });
}

export const DEFAULT_TEMPLATES_BY_KEY = Object.fromEntries(
  DEFAULT_EMAIL_TEMPLATES.map((t) => [t.key, t])
);
