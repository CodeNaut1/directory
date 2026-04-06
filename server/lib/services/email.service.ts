import nodemailer from 'nodemailer';

// Create transporter based on environment
const createTransporter = () => {
  // In production, use direct SMTP with different settings
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Use SSL port instead of TLS
      secure: true, // Use SSL
      pool: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  // In development, use TLS
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.GMAIL_USER || '';
const REPLY_TO_EMAIL = 'hello@bitcoiners.africa';

// Parse comma-separated emails
const getAdminEmails = (): string[] => {
  return process.env.ADMIN_EMAIL
    ? process.env.ADMIN_EMAIL.split(',').map(email => email.trim())
    : [];
};

const getTeamEmails = (): string[] => {
  return process.env.TEAM_EMAIL
    ? process.env.TEAM_EMAIL.split(',').map(email => email.trim())
    : [];
};

const getAllNotificationEmails = (): string[] => {
  return [...getAdminEmails(), ...getTeamEmails()];
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

interface ProjectSubmissionEmailData {
  userName: string;
  userEmail: string;
  projectName: string;
  country: string;
  category: string;
  description: string;
  website?: string;
  submittedAt: string;
}

interface ProjectReviewEmailData {
  userName: string;
  userEmail: string;
  projectName: string;
  status: 'approved' | 'declined' | 'needs_update';
  feedback?: string;
  reviewedAt: string;
}

/**
 * Verify transporter connection
 */
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error);
    return false;
  }
}

/**
 * Send welcome email when user creates account
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FD5A47; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .welcome-box { background: white; padding: 20px; border-left: 4px solid #FD5A47; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to African Bitcoin Directory! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Welcome to the African Bitcoin Directory - your gateway to connecting with the Bitcoin ecosystem across Africa!</p>
            
            <div class="welcome-box">
              <h3 style="margin-top: 0;">What you can do now:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>List Your Project:</strong> Submit your Bitcoin business, community, or initiative</li>
                <li><strong>Explore the Directory:</strong> Discover other projects building with Bitcoin in Africa</li>
                <li><strong>Connect:</strong> Network with builders, businesses, and communities across the continent</li>
                <li><strong>Stay Updated:</strong> Track your submissions and manage your projects</li>
              </ul>
            </div>
            
            <h3>Ready to get started?</h3>
            <p>Head over to your dashboard to submit your first project or explore the directory to see what others are building.</p>
            
            <a href="${FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <p style="margin-top: 30px;">We're excited to have you as part of the African Bitcoin community!</p>
            
            <p>If you have any questions or need help getting started, just reply to this email.</p>
            
            <p>Best regards,<br><strong>African Bitcoiners Team</strong></p>
          </div>
          <div class="footer">
            <p>African Bitcoin Directory | Connecting the African Bitcoin Economy</p>
            <p>You're receiving this because you created an account at ${FRONTEND_URL}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: data.userEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: 'Welcome to African Bitcoin Directory! 🎉',
      html: emailHtml,
    });

    console.log('✅ Welcome email sent to:', data.userEmail, '| Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw - allow registration to continue even if email fails
  }
}

/**
 * Send confirmation email to user after project submission
 */
export async function sendProjectSubmissionConfirmation(data: ProjectSubmissionEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FD5A47; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #FD5A47; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Submitted Successfully! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for submitting your project to the African Bitcoin Directory!</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Project Details:</h3>
              <p><strong>Project Name:</strong> ${data.projectName}</p>
              <p><strong>Country:</strong> ${data.country}</p>
              <p><strong>Category:</strong> ${data.category}</p>
              <p><strong>Submitted:</strong> ${data.submittedAt}</p>
            </div>
            
            <h3>What happens next?</h3>
            <ol>
              <li><strong>Review Process:</strong> Our team will review your submission within 2 business days</li>
              <li><strong>Verification:</strong> We'll check that all information meets our guidelines</li>
              <li><strong>Notification:</strong> You'll receive an email once your project is approved or if we need any changes</li>
              <li><strong>Go Live:</strong> Once approved, your project will be visible in the directory!</li>
            </ol>
            
            <p style="margin-top: 30px;">You can track your submission status in your dashboard:</p>
            <a href="${FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to reply to this email.</p>
            
            <p>Best regards,<br><strong>African Bitcoiners Team</strong></p>
          </div>
          <div class="footer">
            <p>African Bitcoin Directory | Connecting the African Bitcoin Economy</p>
            <p>This email was sent because you submitted a project to our directory.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: data.userEmail,
      replyTo: REPLY_TO_EMAIL,
      subject: `Project Submitted: ${data.projectName}`,
      html: emailHtml,
    });

    console.log('✅ Submission confirmation email sent to:', data.userEmail);
  } catch (error) {
    console.error('❌ Failed to send submission confirmation email:', error);
  }
}

/**
 * Send notification to ADMINS and TEAM about new project submission
 */
export async function sendAdminNotification(data: ProjectSubmissionEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const allRecipients = getAllNotificationEmails();

    if (allRecipients.length === 0) {
      console.warn('⚠️ No admin/team emails configured - skipping notification');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1F2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #FD5A47; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Project Submission</h1>
          </div>
          <div class="content">
            <p>A new project has been submitted to the African Bitcoin Directory and is pending review.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Project Details:</h3>
              <p><strong>Project Name:</strong> ${data.projectName}</p>
              <p><strong>Country:</strong> ${data.country}</p>
              <p><strong>Category:</strong> ${data.category}</p>
              <p><strong>Description:</strong> ${data.description}</p>
              ${data.website ? `<p><strong>Website:</strong> <a href="${data.website}">${data.website}</a></p>` : ''}
              <p><strong>Submitted By:</strong> ${data.userName} (${data.userEmail})</p>
              <p><strong>Submitted At:</strong> ${data.submittedAt}</p>
            </div>
            
            <p>Please review this submission in the admin dashboard:</p>
            <a href="${FRONTEND_URL}/admin/projects" class="button">Review in Admin Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to ALL admins and team members
    await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: allRecipients.join(', '), // Send to everyone
      replyTo: REPLY_TO_EMAIL,
      subject: `[New Submission] ${data.projectName} - ${data.country}`,
      html: emailHtml,
    });

    console.log('✅ Admin notification email sent to:', allRecipients.join(', '));
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error);
  }
}

/**
 * Send project approval email to user (ADMINS get BCC)
 */
export async function sendProjectApprovalEmail(data: ProjectReviewEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .success-box { background: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Project is Now Live!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <div class="success-box">
              <p><strong>Great news!</strong> Your project "${data.projectName}" has been approved and is now visible in the African Bitcoin Directory!</p>
            </div>
            
            <p>Your project is now part of the growing Bitcoin ecosystem in Africa, connecting you with other builders, businesses, and communities across the continent.</p>
            
            <h3>What you can do now:</h3>
            <ul>
              <li>View your live project listing in the directory</li>
              <li>Share your project page with your community</li>
              <li>Update your project details anytime from your dashboard</li>
              <li>Connect with other projects in the ecosystem</li>
            </ul>
            
            <a href="${FRONTEND_URL}/directory" class="button">View in Directory</a>
            
            <p style="margin-top: 30px;">Thank you for being part of the African Bitcoin community!</p>
            
            <p>Best regards,<br><strong>African Bitcoiners Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to user, BCC to admins
    await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: data.userEmail,
      bcc: getAdminEmails().join(', '), // BCC to admins only
      replyTo: REPLY_TO_EMAIL,
      subject: `✅ Project Approved: ${data.projectName}`,
      html: emailHtml,
    });

    console.log('✅ Approval email sent to:', data.userEmail);
  } catch (error) {
    console.error('❌ Failed to send approval email:', error);
  }
}

/**
 * Send project declined email to user (ADMINS get BCC)
 */
export async function sendProjectDeclinedEmail(data: ProjectReviewEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .feedback-box { background: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Submission Update</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for submitting "${data.projectName}" to the African Bitcoin Directory.</p>
            
            <p>After careful review, we're unable to approve your project at this time.</p>
            
            ${data.feedback ? `
            <div class="feedback-box">
              <h3 style="margin-top: 0;">Feedback:</h3>
              <p>${data.feedback}</p>
            </div>
            ` : ''}
            
            <p>If you believe this decision was made in error or if you'd like to discuss this further, please don't hesitate to reach out by replying to this email.</p>
            
            <p>We appreciate your interest in being part of the African Bitcoin ecosystem.</p>
            
            <p>Best regards,<br><strong>African Bitcoiners Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to user, BCC to admins
    await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: data.userEmail,
      bcc: getAdminEmails().join(', '), // BCC to admins only
      replyTo: REPLY_TO_EMAIL,
      subject: `Project Submission Update: ${data.projectName}`,
      html: emailHtml,
    });

    console.log('✅ Declined email sent to:', data.userEmail);
  } catch (error) {
    console.error('❌ Failed to send declined email:', error);
  }
}

/**
 * Send changes requested email to user (ADMINS get BCC)
 */
export async function sendChangesRequestedEmail(data: ProjectReviewEmailData) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured - skipping email');
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #FD5A47; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .feedback-box { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Changes Requested for Your Project</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for submitting "${data.projectName}" to the African Bitcoin Directory.</p>
            
            <p>We've reviewed your submission and would like to request some changes before we can approve it.</p>
            
            ${data.feedback ? `
            <div class="feedback-box">
              <h3 style="margin-top: 0;">Requested Changes:</h3>
              <p>${data.feedback}</p>
            </div>
            ` : ''}
            
            <p>Please update your project with the requested changes and resubmit it from your dashboard.</p>
            
            <a href="${FRONTEND_URL}/dashboard" class="button">Update Project</a>
            
            <p style="margin-top: 30px;">If you have any questions about the requested changes, feel free to reply to this email.</p>
            
            <p>Best regards,<br><strong>African Bitcoiners Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to user, BCC to admins
    await transporter.sendMail({
      from: `"African Bitcoin Directory" <${FROM_EMAIL}>`,
      to: data.userEmail,
      bcc: getAdminEmails().join(', '), // BCC to admins only
      replyTo: REPLY_TO_EMAIL,
      subject: `Changes Requested: ${data.projectName}`,
      html: emailHtml,
    });

    console.log('✅ Changes requested email sent to:', data.userEmail);
  } catch (error) {
    console.error('❌ Failed to send changes requested email:', error);
  }
}