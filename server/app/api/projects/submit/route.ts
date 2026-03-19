import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/utils/api-handler';
import { successResponse } from '@/lib/utils/api-response';
import { createProjectSchema, type CreateProjectInput } from '@/lib/validators';
import { createProject } from '@/lib/services/project.service';
import { appendToSheet } from '@/lib/services/googleSheets';
import { sendProjectSubmissionConfirmation, sendAdminNotification } from '@/lib/services/email.service';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/db';

/**
 * Submit a new project (with optional logo upload)
 * POST /api/projects/submit
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(req);

    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    let body: CreateProjectInput;
    let logoPath: string | undefined;

    const contentType = req.headers.get('content-type') || '';

    // Check if request contains FormData (multipart)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      // Extract logo file
      const logoFile = formData.get('logo') as File | null;

      // Extract JSON data
      const dataString = formData.get('data') as string | null;

      if (!dataString) {
        return NextResponse.json(
          { success: false, error: 'Missing project data' },
          { status: 400 }
        );
      }

      // Parse JSON data
      body = JSON.parse(dataString);

      // Process logo upload if present
      if (logoFile && logoFile.size > 0) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(logoFile.type)) {
          return NextResponse.json(
            { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
            { status: 400 }
          );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (logoFile.size > maxSize) {
          return NextResponse.json(
            { success: false, error: 'File too large. Maximum size is 5MB.' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const ext = logoFile.name.split('.').pop() || 'png';
        const filename = `${nanoid()}.${ext}`;

        // Save to public/uploads/logos directory
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos');
        const filepath = join(uploadDir, filename);

        // Ensure directory exists
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadDir, { recursive: true });

        // Write file
        await writeFile(filepath, buffer);

        // Store relative path for database
        logoPath = `/uploads/logos/${filename}`;
      }
    } else {
      // Regular JSON request (no logo)
      body = await req.json();
    }

    // Validate request body
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation failed', details: validation.error.errors } },
        { status: 400 }
      );
    }

    // Add logo path to body if uploaded
    if (logoPath) {
      body.logo = logoPath;
    }

    // Create project
    const project = await createProject(user, body);

    // 🔥 Fire-and-forget: Google Sheets + Email notifications
    setImmediate(async () => {
      try {
        const [country, category, tags] = await Promise.all([
          prisma.country.findUnique({
            where: { id: body.countryId },
            select: { name: true },
          }),
          prisma.category.findUnique({
            where: { id: body.categoryId },
            select: { name: true },
          }),
          body.tagIds
            ? prisma.tag.findMany({
              where: { id: { in: body.tagIds } },
              select: { name: true },
            })
            : Promise.resolve([]),
        ]);

        const tagNames = tags.map((t: { name: string }) => t.name);
        const submittedAt = new Date().toLocaleString('en-US', {
          timeZone: 'Africa/Lagos',
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        // Google Sheets sync
        await appendToSheet({
          projectName: body.name,
          countryName: country?.name || '',
          categoryName: category?.name || '',
          tags: tagNames,
          bitcoinOnchain: body.details?.bitcoinOnly || false,
          lightning: body.details?.lightningNetwork || false,
          giftCards: body.details?.giftCards || false,
          description: body.description,
          longDescription: body.details?.longDescription,
          initiatives: body.details?.initiatives,
          impact: body.details?.impact,
          challenges: body.details?.challenges,
          websiteUrl: body.website,
          email: body.details?.contactEmail || '',
          phone: body.details?.contactPhone,
          foundedYear: body.foundedYear,
          founderName: body.details?.founderName,
          founderTwitter: body.details?.founderTwitter,
          founderEmail: body.details?.founderEmail,
          twitterHandle: body.details?.socialLinks?.twitter,
          linkedinUsername: body.details?.socialLinks?.linkedin,
          facebookUsername: body.details?.socialLinks?.facebook,
          youtubeChannel: body.details?.socialLinks?.youtube,
          telegramGroup: body.details?.socialLinks?.telegram,
          nostrAddress: body.details?.socialLinks?.nostr,
          instagramUsername: body.details?.socialLinks?.instagram,
          submittedAt,
          submittedBy: user?.email || 'Unknown',
        });

        // Send emails
        const emailData = {
          userName: user?.name || user?.email?.split('@')[0] || 'User',
          userEmail: user?.email || body.details?.contactEmail || '',
          projectName: body.name,
          country: country?.name || '',
          category: category?.name || '',
          description: body.description,
          website: body.website,
          submittedAt,
        };

        await Promise.all([
          sendProjectSubmissionConfirmation(emailData),
          sendAdminNotification(emailData),
        ]);

        console.log('✅ Project synced to Google Sheet and emails sent');
      } catch (error) {
        console.error('⚠️ Background tasks failed:', error);
      }
    });

    // Return immediately without waiting for sheets sync
    return NextResponse.json(successResponse(project), { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/projects/submit:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}