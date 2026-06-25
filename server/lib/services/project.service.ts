/**
 * Project service - UPDATED for new schema
 * Handles project-related business logic
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NotFoundError, AuthorizationError } from '@/lib/utils/errors';
import type { CreateProjectInput, UpdateProjectInput, ProjectListQuery } from '@/lib/validators';
import { AuthenticatedUser } from '@/lib/auth/middleware';
// @ts-ignore - slugify doesn't have types
import slugify from 'slugify';


/**
 * Transform database project to match projects.json format for frontend compatibility
 */
/**
 * Transform database project to match projects.json format for frontend compatibility
 */
function transformProjectToJsonFormat(project: any) {
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    description: project.description,

    // Location
    country_code: project.countryCode || project.country?.code || '',
    country_name: project.countryName || project.country?.name || '',
    city: project.city || '',
    location: project.location || (project.city && project.country?.name ? `${project.city}, ${project.country.name}` : ''),

    // Images
    image: project.logo || '',

    // Contact
    website: project.website || '',
    email: project.email || '',

    // Categories
    categories: project.categories || [project.category?.name].filter(Boolean) || [],

    // Tags
    tags: project.tags?.map((pt: any) => pt.tag?.name || pt.name).filter(Boolean) || [],

    // Social links
    social: project.socialLinks || {
      twitter: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      youtube: '',
      telegram: '',
      nostr: '',
    },

    // Bitcoin acceptance
    bitcoin_acceptance: {
      onchain: project.acceptsOnchain || false,
      lightning: project.acceptsLightning || false,
      gift_cards: project.acceptsGiftCards || false,
    },

    // Founder
    founder: {
      name: project.founderName || '',
      twitter: project.founderTwitter || '',
      email: project.founderEmail || '',
    },

    // Text fields
    initiatives: project.initiatives || '',
    impact: project.impact || '',
    challenges: project.challenges || '',

    // Status - KEEP THESE FROM DATABASE
    verified: project.verified || false,
    featured: project.featured || false,
    published: project.published || false,  // ← ADD THIS
    status: project.status || 'pending',
    active: project.active !== undefined ? project.active : true,

    // Timestamps
    founded_year: project.foundedYear || '',
    created_at: project.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: project.updatedAt?.toISOString() || new Date().toISOString(),

    // CRITICAL: Include userId for ownership checks
    userId: project.userId || null,  // ← ADD THIS
  };
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
    published: true, // Only show published
    status: 'approved', // Only show approved projects
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
    data: projects.map(transformProjectToJsonFormat),
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
      published: true,
      verified: true,
      featured: true,
      active: true,
      status: true,
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

  return projects.map(transformProjectToJsonFormat);
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
      published: true,
      verified: true,
      featured: true,
      active: true,
      status: true,
      userId: true,  // ← CRITICAL for ownership check
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
  const isPublished = project.published && project.status === 'approved';

  // Allow access if:
  // 1. Project is published and approved (public)
  // 2. User is the owner (can view their own submissions)
  // 3. User is admin/moderator
  if (!isPublished && !isOwner && !isAdmin) {
    throw new Error('This project is currently under review and will be visible once approved.');
  }

  return transformProjectToJsonFormat(project);
}

/**
 * Create a new project
 */
export async function createProject(user: AuthenticatedUser, input: CreateProjectInput) {
  const slug = await ensureUniqueSlug(generateSlug(input.name));
  const details = input.details;

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
      published: false,
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

  return transformProjectToJsonFormat(project);
}

/**
 * Update a project
 */
export async function updateProject(
  user: AuthenticatedUser,
  projectId: string,
  input: UpdateProjectInput
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, slug: true, name: true },
  });

  if (!project) throw new NotFoundError('Project not found');

  if (project.userId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    throw new AuthorizationError('You do not have permission to update this project');
  }

  let slug = project.slug;
  if (input.name && input.name !== project.name) {
    slug = await ensureUniqueSlug(generateSlug(input.name), projectId);
  }

  const updateData: any = {};
  if (input.name) { updateData.name = input.name; updateData.slug = slug; }
  if (input.description !== undefined) updateData.description = input.description;
  if (input.website !== undefined) updateData.website = input.website || null;
  if (input.logo !== undefined) updateData.logo = input.logo || null;
  if (input.coverImage !== undefined) updateData.coverImage = input.coverImage || null;
  if (input.countryId) updateData.countryId = input.countryId;
  if (input.categoryId) updateData.categoryId = input.categoryId;
  if (input.city !== undefined) updateData.city = input.city || null;
  if (input.address !== undefined) updateData.address = input.address || null;

  if (input.tagIds) {
    updateData.tags = {
      deleteMany: {},
      create: input.tagIds.map((tagId) => ({ tagId })),
    };
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

  return transformProjectToJsonFormat(updated);
}

/**
 * Delete a project
 */
export async function deleteProject(user: AuthenticatedUser, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) throw new NotFoundError('Project not found');

  if (project.userId !== user.id && user.role !== 'admin') {
    throw new AuthorizationError('You do not have permission to delete this project');
  }

  await prisma.project.delete({ where: { id: projectId } });
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

  return submission;
}