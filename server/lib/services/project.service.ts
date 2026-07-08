/**
 * Project service - UPDATED for new schema
 * Handles project-related business logic
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NotFoundError, AuthorizationError, ConflictError } from '@/lib/utils/errors';
import type { CreateProjectInput, UpdateProjectInput, ProjectListQuery } from '@/lib/validators';
import { AuthenticatedUser } from '@/lib/auth/middleware';
import { scheduleProjectsJsonSync, scheduleRemoveProjectFromJson, transformDbProjectToJsonEntry } from '@/lib/services/projects-json-sync.service';
// @ts-ignore - slugify doesn't have types
import slugify from 'slugify';

function normalizeWebsite(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

function normalizeTwitterHandle(urlOrHandle: string): string {
  return urlOrHandle
    .toLowerCase()
    .replace('@', '')
    .split('/')
    .pop()
    ?.split('?')[0] ?? '';
}

export interface DuplicateProjectMatch {
  id: string;
  name: string;
  slug: string;
  status: string;
  website: string | null;
  countryName: string | null;
  matchReasons: string[];
}

/**
 * Find projects that conflict with a new submission.
 * Checks pending and approved projects only — rejected/unpublished can be resubmitted.
 */
export async function findDuplicateProjects(input: {
  name: string;
  website?: string;
  twitter?: string;
  excludeProjectId?: string;
}): Promise<DuplicateProjectMatch[]> {
  const trimmedName = input.name.trim();
  if (!trimmedName) return [];

  const candidates = await prisma.project.findMany({
    where: {
      status: { in: ['pending', 'approved'] },
      ...(input.excludeProjectId && { id: { not: input.excludeProjectId } }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      website: true,
      socialLinks: true,
      countryName: true,
      country: { select: { name: true } },
    },
  });

  const normalizedWebsite = input.website ? normalizeWebsite(input.website) : null;
  const normalizedTwitter = input.twitter ? normalizeTwitterHandle(input.twitter) : null;
  const matches: DuplicateProjectMatch[] = [];

  for (const project of candidates) {
    const reasons: string[] = [];

    if (project.name.trim().toLowerCase() === trimmedName.toLowerCase()) {
      reasons.push('Same project name');
    }

    if (normalizedWebsite && project.website) {
      if (normalizeWebsite(project.website) === normalizedWebsite) {
        reasons.push('Same website');
      }
    }

    if (normalizedTwitter) {
      const social = project.socialLinks as Record<string, string> | null;
      const projectTwitter = social?.twitter;
      if (projectTwitter && normalizeTwitterHandle(projectTwitter) === normalizedTwitter) {
        reasons.push('Same Twitter handle');
      }
    }

    if (reasons.length > 0) {
      matches.push({
        id: project.id,
        name: project.name,
        slug: project.slug,
        status: project.status,
        website: project.website,
        countryName: project.countryName || project.country?.name || null,
        matchReasons: reasons,
      });
    }
  }

  return matches;
}

async function assertNoDuplicateProject(input: {
  name: string;
  website?: string;
  twitter?: string;
  excludeProjectId?: string;
}) {
  const duplicates = await findDuplicateProjects(input);
  if (duplicates.length === 0) return;

  const nameDuplicate = duplicates.find((d) => d.matchReasons.includes('Same project name'));
  if (nameDuplicate) {
    const statusNote =
      nameDuplicate.status === 'pending'
        ? 'A submission with this name is already awaiting review.'
        : 'A project with this name is already listed in the directory.';
    throw new ConflictError(
      `${statusNote} Please wait for a decision, or edit your existing submission from your dashboard instead of submitting again.`
    );
  }

  throw new ConflictError(
    'This project appears to already exist in our directory (matching website or social handle). Please review your existing submission or contact support.'
  );
}

/**
 * Generate a unique slug from name
 */
function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

/**
 * Ensure slug is unique
 */
async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing || existing.id === excludeId) {
      break;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * List projects with filtering and pagination
 */
export async function listProjects(query: ProjectListQuery) {
  const { page, limit, category, country, tag, search, featured, sort } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    status: 'approved',
    ...(featured !== undefined && { featured }),
    ...(category && {
      OR: [
        { category: { slug: category } },
        { categories: { has: category } },
      ],
    }),
    ...(country && {
      OR: [
        { country: { code: country } },
        { countryCode: country.toLowerCase() },
      ],
    }),
    ...(tag && {
      tags: {
        some: {
          tag: { slug: tag },
        },
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  else if (sort === 'name') orderBy = { name: 'asc' };

  // Get projects and total count
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        country: true,
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects.map(transformDbProjectToJsonEntry),
    meta: { page, limit, total },
  };
}

/**
 * Get user's projects
 */
/**
 * Get user's projects
 */
export async function getUserProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      location: true,
      city: true,
      countryCode: true,
      countryName: true,
      logo: true,
      website: true,
      email: true,
      categories: true,
      socialLinks: true,
      acceptsOnchain: true,
      acceptsLightning: true,
      acceptsGiftCards: true,
      founderName: true,
      founderTwitter: true,
      founderEmail: true,
      initiatives: true,
      impact: true,
      challenges: true,
      foundedYear: true,
      verified: true,
      featured: true,
      active: true,
      status: true,
      adminFeedbackNotes: true,
      adminFeedbackAt: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      country: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return projects.map(transformDbProjectToJsonEntry);
}

/**
 * Get project by ID or slug
 * Allows viewing unpublished projects if user is owner/admin
 */
export async function getProjectById(idOrSlug: string, requestingUser?: AuthenticatedUser) {
  const project = await prisma.project.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      location: true,
      city: true,
      address: true,
      countryId: true,
      countryCode: true,
      countryName: true,
      categoryId: true,
      logo: true,
      coverImage: true,
      website: true,
      email: true,
      categories: true,
      socialLinks: true,
      acceptsOnchain: true,
      acceptsLightning: true,
      acceptsGiftCards: true,
      founderName: true,
      founderTwitter: true,
      founderEmail: true,
      initiatives: true,
      impact: true,
      challenges: true,
      foundedYear: true,
      verified: true,
      featured: true,
      active: true,
      status: true,
      adminFeedbackNotes: true,
      adminFeedbackAt: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      country: {
        select: {
          id: true,
          code: true,
          name: true,
          flag: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check visibility rules
  const isOwner = requestingUser && project.userId === requestingUser.id;
  const isAdmin = requestingUser && (requestingUser.role === 'admin' || requestingUser.role === 'moderator');
  const isPublic = project.status === 'approved';

  // Allow access if:
  // 1. Project is approved (public)
  // 2. User is the owner (can view their own submissions)
  // 3. User is admin/moderator
  if (!isPublic && !isOwner && !isAdmin) {
    throw new AuthorizationError('This project is currently under review and will be visible once approved.');
  }

  const entry = transformDbProjectToJsonEntry(project);

  return {
    ...entry,
    countryId: project.countryId,
    categoryId: project.categoryId,
    tagIds: project.tags
      ?.map((pt) => pt.tag?.id)
      .filter((id): id is string => Boolean(id)) ?? [],
  };
}

/**
 * Create a new project
 */
export async function createProject(user: AuthenticatedUser, input: CreateProjectInput) {
  const details = input.details;
  const twitter = details?.socialLinks?.twitter;

  await assertNoDuplicateProject({
    name: input.name,
    website: input.website || undefined,
    twitter: twitter || undefined,
  });

  const slug = await ensureUniqueSlug(generateSlug(input.name));

  const countryId = input.countryId === 'global' ? null : input.countryId;

  const [country, category] = await Promise.all([
    countryId
      ? prisma.country.findUnique({ where: { id: countryId }, select: { code: true, name: true } })
      : Promise.resolve(null),
    prisma.category.findUnique({ where: { id: input.categoryId }, select: { name: true } }),
  ]);

  const project = await prisma.project.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      website: input.website || null,
      logo: input.logo || null,
      coverImage: input.coverImage || null,
      countryId,
      categoryId: input.categoryId,
      city: input.city || null,
      address: input.address || null,
      userId: user.id,
      status: 'pending',
      email: details?.contactEmail || null,
      foundedYear: input.foundedYear || null,
      countryCode: country?.code?.toLowerCase() || null,
      countryName: country?.name || null,
      categories: category ? [category.name] : [],
      socialLinks: details?.socialLinks ?? undefined,
      acceptsOnchain: details?.bitcoinOnly ?? false,
      acceptsLightning: details?.lightningNetwork ?? false,
      acceptsGiftCards: details?.giftCards ?? false,
      founderName: details?.founderName || null,
      founderTwitter: details?.founderTwitter || null,
      founderEmail: details?.founderEmail || null,
      initiatives: details?.initiatives || null,
      impact: details?.impact || null,
      challenges: details?.challenges || null,
      ...(input.tagIds && {
        tags: {
          create: input.tagIds.map((tagId) => ({ tagId })),
        },
      }),
    },
    include: {
      country: true,
      category: true,
      tags: { include: { tag: true } },
    },
  });

  scheduleProjectsJsonSync(project.id);

  return transformDbProjectToJsonEntry(project);
}

/**
 * Update a project. Owner edits are sent back for review (status → pending).
 */
export async function updateProject(
  user: AuthenticatedUser,
  projectId: string,
  input: UpdateProjectInput
): Promise<{ project: ReturnType<typeof transformDbProjectToJsonEntry>; submittedForReview: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, slug: true, name: true, status: true },
  });

  if (!project) throw new NotFoundError('Project not found');

  if (project.userId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    throw new AuthorizationError('You do not have permission to update this project');
  }

  const isStaffEdit = user.role === 'admin' || user.role === 'moderator';
  const isOwnerEdit = project.userId === user.id && !isStaffEdit;
  const submittedForReview = isOwnerEdit;

  const updateData: any = {};
  if (input.name) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.website !== undefined) updateData.website = input.website || null;
  if (input.logo !== undefined) updateData.logo = input.logo || null;
  if (input.coverImage !== undefined) updateData.coverImage = input.coverImage || null;
  if (input.city !== undefined) updateData.city = input.city || null;
  if (input.address !== undefined) updateData.address = input.address || null;

  if (input.tagIds) {
    updateData.tags = {
      deleteMany: {},
      create: input.tagIds.map((tagId) => ({ tagId })),
    };
  }

  if (input.foundedYear !== undefined) {
    updateData.foundedYear = input.foundedYear || null;
  }

  const details = input.details;
  if (details) {
    if (details.contactEmail !== undefined) updateData.email = details.contactEmail || null;
    if (details.socialLinks !== undefined) updateData.socialLinks = details.socialLinks;
    if (details.bitcoinOnly !== undefined) updateData.acceptsOnchain = details.bitcoinOnly;
    if (details.lightningNetwork !== undefined) updateData.acceptsLightning = details.lightningNetwork;
    if (details.giftCards !== undefined) updateData.acceptsGiftCards = details.giftCards;
    if (details.founderName !== undefined) updateData.founderName = details.founderName || null;
    if (details.founderTwitter !== undefined) updateData.founderTwitter = details.founderTwitter || null;
    if (details.founderEmail !== undefined) updateData.founderEmail = details.founderEmail || null;
    if (details.initiatives !== undefined) updateData.initiatives = details.initiatives || null;
    if (details.impact !== undefined) updateData.impact = details.impact || null;
    if (details.challenges !== undefined) updateData.challenges = details.challenges || null;
  }

  if (input.countryId) {
    const countryId = input.countryId === 'global' ? null : input.countryId;
    updateData.countryId = countryId;
    const country = countryId
      ? await prisma.country.findUnique({ where: { id: countryId }, select: { code: true, name: true } })
      : null;
    updateData.countryCode = country?.code?.toLowerCase() || null;
    updateData.countryName = country?.name || null;
  }

  if (input.categoryId) {
    updateData.categoryId = input.categoryId;
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { name: true },
    });
    if (category) updateData.categories = [category.name];
  }

  if (submittedForReview) {
    updateData.status = 'pending';
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
    include: {
      country: true,
      category: true,
      tags: { include: { tag: true } },
    },
  });

  scheduleProjectsJsonSync(updated.id);

  return {
    project: transformDbProjectToJsonEntry(updated),
    submittedForReview,
  };
}

/**
 * Delete a project
 */
export async function deleteProject(user: AuthenticatedUser, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, slug: true },
  });

  if (!project) throw new NotFoundError('Project not found');

  if (project.userId !== user.id && user.role !== 'admin') {
    throw new AuthorizationError('You do not have permission to delete this project');
  }

  await prisma.project.delete({ where: { id: projectId } });
  scheduleRemoveProjectFromJson(project.slug);
}

/**
 * Submit project for review
 */
export async function submitProjectForReview(user: AuthenticatedUser, projectId: string, notes?: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) throw new NotFoundError('Project not found');

  if (project.userId !== user.id) {
    throw new AuthorizationError('You do not have permission to submit this project');
  }

  const submission = await prisma.submission.create({
    data: {
      projectId,
      userId: user.id,
      status: 'pending',
      notes: notes || null,
    },
    include: {
      project: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  scheduleProjectsJsonSync(projectId);

  return submission;
}