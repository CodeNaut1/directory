/**
 * Project service
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
 * Generate a unique slug from name
 */
function generateSlug(name: string, existingSlug?: string): string {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return baseSlug;
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
    published: true, // Only show published projects
    ...(featured !== undefined && { featured }),
    ...(category && {
      category: {
        slug: category,
      },
    }),
    ...(country && {
      country: {
        code: country,
      },
    }),
    ...(tag && {
      tags: {
        some: {
          tag: {
            slug: tag,
          },
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
  const orderBy: any = {};
  if (sort === 'newest') {
    orderBy.createdAt = 'desc';
  } else if (sort === 'oldest') {
    orderBy.createdAt = 'asc';
  } else if (sort === 'name') {
    orderBy.name = 'asc';
  } else {
    orderBy.createdAt = 'desc'; // Default
  }

  // Get projects and total count
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        logo: true,
        coverImage: true,
        published: true,
        featured: true,
        verified: true,
        city: true,
        address: true,
        createdAt: true,
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
          select: {
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
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  // Transform tags structure
  const transformedProjects = projects.map((project) => ({
    ...project,
    tags: project.tags.map((pt) => pt.tag),
  }));

  return {
    data: transformedProjects,
    meta: {
      page,
      limit,
      total,
    },
  };
}

/**
 * Get project by ID or slug
 */
export async function getProjectById(idOrSlug: string) {
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: {
      country: true,
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
      details: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          reviews: {
            where: {
              published: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Only show published projects to non-owners
  // (Ownership check will be done in the route handler if needed)

  // Transform tags
  const transformedProject = {
    ...project,
    tags: project.tags.map((pt) => pt.tag),
  };

  return transformedProject;
}

/**
 * Create a new project
 */
export async function createProject(user: AuthenticatedUser, input: CreateProjectInput) {
  // Generate slug
  const baseSlug = generateSlug(input.name);
  const slug = await ensureUniqueSlug(baseSlug);

  // Create project
  const project = await prisma.project.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      website: input.website || null,
      logo: input.logo || null,
      coverImage: input.coverImage || null,
      countryId: input.countryId,
      categoryId: input.categoryId,
      city: input.city || null,
      address: input.address || null,
      userId: user.id,
      published: false, // Projects start as unpublished
      ...(input.tagIds && {
        tags: {
          create: input.tagIds.map((tagId) => ({
            tagId,
          })),
        },
      }),
      ...(input.details && {
        details: {
          create: {
            longDescription: input.details.longDescription || null,
            ...(input.details.socialLinks !== undefined && {
              socialLinks: input.details.socialLinks || Prisma.JsonNull,
            }),
            contactEmail: input.details.contactEmail || null,
            contactPhone: input.details.contactPhone || null,
            foundedYear: input.details.foundedYear || null,
            teamSize: input.details.teamSize || null,
            fundingStage: input.details.fundingStage || null,
            bitcoinOnly: input.details.bitcoinOnly || false,
            lightningNetwork: input.details.lightningNetwork || false,
            metaTitle: input.details.metaTitle || null,
            metaDescription: input.details.metaDescription || null,
          },
        },
      }),
    },
    include: {
      country: {
        select: {
          code: true,
          name: true,
          flag: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return project;
}

/**
 * Update a project
 */
export async function updateProject(
  user: AuthenticatedUser,
  projectId: string,
  input: UpdateProjectInput
) {
  // Check if project exists and user owns it
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true, slug: true, name: true },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.userId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    throw new AuthorizationError('You do not have permission to update this project');
  }

  // Generate new slug if name changed
  let slug = project.slug;
  if (input.name && input.name !== project.name) {
    const baseSlug = generateSlug(input.name);
    slug = await ensureUniqueSlug(baseSlug, projectId);
  }

  // Build update data
  const updateData: any = {};
  
  if (input.name) {
    updateData.name = input.name;
    updateData.slug = slug;
  }
  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.website !== undefined) {
    updateData.website = input.website || null;
  }
  if (input.logo !== undefined) {
    updateData.logo = input.logo || null;
  }
  if (input.coverImage !== undefined) {
    updateData.coverImage = input.coverImage || null;
  }
  if (input.countryId) {
    updateData.countryId = input.countryId;
  }
  if (input.categoryId) {
    updateData.categoryId = input.categoryId;
  }
  if (input.city !== undefined) {
    updateData.city = input.city || null;
  }
  if (input.address !== undefined) {
    updateData.address = input.address || null;
  }
  if (input.tagIds) {
    updateData.tags = {
      deleteMany: {},
      create: input.tagIds.map((tagId) => ({
        tagId,
      })),
    };
  }
  
  if (input.details) {
    const detailsData: any = {
      create: {
        longDescription: input.details.longDescription || null,
        ...(input.details.socialLinks !== undefined && {
          socialLinks: input.details.socialLinks || Prisma.JsonNull,
        }),
        contactEmail: input.details.contactEmail || null,
        contactPhone: input.details.contactPhone || null,
        foundedYear: input.details.foundedYear || null,
        teamSize: input.details.teamSize || null,
        fundingStage: input.details.fundingStage || null,
        bitcoinOnly: input.details.bitcoinOnly || false,
        lightningNetwork: input.details.lightningNetwork || false,
        metaTitle: input.details.metaTitle || null,
        metaDescription: input.details.metaDescription || null,
      },
      update: {},
    };
    
    if (input.details.longDescription !== undefined) {
      detailsData.update.longDescription = input.details.longDescription || null;
    }
    if (input.details.socialLinks !== undefined) {
      detailsData.update.socialLinks = input.details.socialLinks || Prisma.JsonNull;
    }
    if (input.details.contactEmail !== undefined) {
      detailsData.update.contactEmail = input.details.contactEmail || null;
    }
    if (input.details.contactPhone !== undefined) {
      detailsData.update.contactPhone = input.details.contactPhone || null;
    }
    if (input.details.foundedYear !== undefined) {
      detailsData.update.foundedYear = input.details.foundedYear || null;
    }
    if (input.details.teamSize !== undefined) {
      detailsData.update.teamSize = input.details.teamSize || null;
    }
    if (input.details.fundingStage !== undefined) {
      detailsData.update.fundingStage = input.details.fundingStage || null;
    }
    if (input.details.bitcoinOnly !== undefined) {
      detailsData.update.bitcoinOnly = input.details.bitcoinOnly;
    }
    if (input.details.lightningNetwork !== undefined) {
      detailsData.update.lightningNetwork = input.details.lightningNetwork;
    }
    if (input.details.metaTitle !== undefined) {
      detailsData.update.metaTitle = input.details.metaTitle || null;
    }
    if (input.details.metaDescription !== undefined) {
      detailsData.update.metaDescription = input.details.metaDescription || null;
    }
    
    updateData.details = {
      upsert: detailsData,
    };
  }
  
  // Update project
  const updated = await prisma.project.update({
    where: { id: projectId },
    data: updateData as any, // Type assertion needed due to conditional fields
    include: {
      country: {
        select: {
          code: true,
          name: true,
          flag: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Transform tags
  return {
    ...updated,
    tags: updated.tags.map((pt) => pt.tag),
  };
}

/**
 * Delete a project
 */
export async function deleteProject(user: AuthenticatedUser, projectId: string) {
  // Check if project exists and user owns it
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.userId !== user.id && user.role !== 'admin') {
    throw new AuthorizationError('You do not have permission to delete this project');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}

/**
 * Submit project for review
 */
export async function submitProjectForReview(user: AuthenticatedUser, projectId: string, notes?: string) {
  // Check if project exists and user owns it
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.userId !== user.id) {
    throw new AuthorizationError('You do not have permission to submit this project');
  }

  // Create submission record
  const submission = await prisma.submission.create({
    data: {
      projectId,
      userId: user.id,
      status: 'pending',
      notes: notes || null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return submission;
}

