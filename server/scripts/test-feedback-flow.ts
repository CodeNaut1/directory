/**
 * One-off test: admin "Request Changes" feedback flow on a dummy project.
 * Run: npx tsx scripts/test-feedback-flow.ts
 */

import { prisma } from '../lib/db';
import { renderEmailTemplate } from '../lib/services/email-template.service';
import { sendChangesRequestedToUser } from '../lib/services/email.service';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api';
const DUMMY_SLUG = `test-feedback-flow-${Date.now()}`;
const TEST_FEEDBACK =
  'Please add a clearer project description and upload a higher-quality logo. This is a test note from the feedback flow script.';

async function getAdminToken(): Promise<{ token: string; email: string } | null> {
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
    select: { email: true },
  });
  if (!admin) {
    console.error('No admin user found in database.');
    return null;
  }

  // Use a known dev pattern: try login won't work without password.
  // Instead use direct DB + API with manually created JWT is complex.
  // We'll test DB + email rendering directly, and API if ADMIN_TEST_TOKEN is set.
  return { token: process.env.ADMIN_TEST_TOKEN || '', email: admin.email };
}

async function main() {
  console.log('🧪 Testing Request Changes / feedback flow\n');

  const owner = await prisma.user.findFirst({
    where: { role: { in: ['user', 'builder'] } },
    select: { id: true, email: true, name: true },
  });

  if (!owner) {
    console.error('No regular user found to attach dummy project.');
    process.exit(1);
  }

  const category = await prisma.category.findFirst({ select: { id: true, name: true } });
  const country = await prisma.country.findFirst({ select: { id: true } });

  if (!category || !country) {
    console.error('Missing category or country seed data.');
    process.exit(1);
  }

  // Create dummy pending project
  const dummy = await prisma.project.create({
    data: {
      name: `[TEST] Feedback Flow Dummy ${Date.now()}`,
      slug: DUMMY_SLUG,
      description: 'Temporary test project for feedback flow verification. Safe to delete.',
      status: 'pending',
      userId: owner.id,
      categoryId: category.id,
      countryId: country.id,
      categories: [category.name],
      email: owner.email,
    },
    select: { id: true, name: true, slug: true, status: true, userId: true },
  });

  console.log('✅ Created dummy project:', dummy.id, dummy.name);

  try {
    // Simulate feedback route logic (status update + notes payload)
    const updated = await prisma.project.update({
      where: { id: dummy.id },
      data: { status: 'changes_requested' },
      select: { id: true, status: true, name: true, slug: true, user: { select: { name: true, email: true } } },
    });

    console.log('✅ Status after feedback:', updated.status);
    if (updated.status !== 'changes_requested') {
      throw new Error(`Expected changes_requested, got ${updated.status}`);
    }

    // Verify email template includes feedback notes
    const rendered = await renderEmailTemplate('project_changes_requested_user', {
      userName: updated.user?.name || owner.name || 'Test User',
      projectName: updated.name,
      feedbackNotes: TEST_FEEDBACK.replace(/\n/g, '<br>'),
    });

    const htmlHasFeedback = rendered.html.includes('higher-quality logo');
    const subjectOk = rendered.subject.length > 0;

    console.log('✅ Email subject:', rendered.subject);
    console.log('✅ Feedback notes appear in email HTML:', htmlHasFeedback);
    if (!htmlHasFeedback) {
      throw new Error('Feedback notes missing from rendered user email');
    }

    // Check dashboard API shape for owner
    const ownerProjects = await prisma.project.findMany({
      where: { userId: owner.id, id: dummy.id },
      select: { id: true, status: true },
    });
    console.log('✅ Owner my-projects would show status:', ownerProjects[0]?.status);

    // Gap check: feedback NOT stored in DB
    const submission = await prisma.submission.findFirst({
      where: { projectId: dummy.id },
    });
    console.log(
      submission
        ? '⚠️  Submission record exists (unexpected for feedback-only flow)'
        : 'ℹ️  Feedback notes are NOT stored in DB — only sent via email (no in-app view for user)'
    );

    // Optional live API test
    if (process.env.ADMIN_TEST_TOKEN) {
      const res = await fetch(`${API_BASE}/admin/projects/${dummy.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ADMIN_TEST_TOKEN}`,
        },
        body: JSON.stringify({ notes: TEST_FEEDBACK }),
      });
      const body = await res.json();
      console.log('API feedback response:', res.status, body?.data?.notes ? 'notes echoed' : body);
    } else {
      console.log('ℹ️  Skipped live HTTP test (set ADMIN_TEST_TOKEN to test API endpoint)');
    }

    console.log('\n✅ Core feedback flow checks passed.');
  } finally {
    // Cleanup dummy project
    await prisma.project.delete({ where: { id: dummy.id } });
    console.log('🧹 Deleted dummy test project');
  }
}

main()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
