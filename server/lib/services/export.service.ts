/**
 * Export service — CSV export of submitted projects
 */

import { prisma } from '@/lib/db';
import { SubmissionStatus } from '@prisma/client';
import { toCsv } from '@/lib/utils/csv';

export interface ExportProjectsFilters {
  startDate: Date;
  endDate: Date;
  status?: SubmissionStatus;
}

type ProjectWithRelations = Awaited<ReturnType<typeof fetchProjectsForExport>>[number];

const CSV_HEADERS = [
  'Submitted At',
  'Project ID',
  'Project Name',
  'Slug',
  'Status',
  'Published',
  'Verified',
  'Featured',
  'Active',
  'Country',
  'Country Code',
  'City',
  'Location',
  'Address',
  'Category',
  'Categories',
  'Tags',
  'Short Description',
  'Initiatives',
  'Impact',
  'Challenges',
  'Website',
  'Email',
  'Founded Year',
  'Logo URL',
  'Bitcoin Onchain',
  'Lightning Network',
  'Gift Cards',
  'Twitter',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'YouTube',
  'Telegram',
  'Nostr',
  'Founder Name',
  'Founder Twitter',
  'Founder Email',
  'Submitted By Name',
  'Submitted By Email',
  'Published At',
  'Updated At',
];

async function fetchProjectsForExport(filters: ExportProjectsFilters) {
  return prisma.project.findMany({
    where: {
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
      ...(filters.status && { status: filters.status }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      country: { select: { code: true, name: true } },
      category: { select: { name: true } },
      tags: { include: { tag: { select: { name: true } } } },
      user: { select: { name: true, email: true } },
    },
  });
}

function getSocialLink(links: unknown, key: string): string {
  if (!links || typeof links !== 'object' || Array.isArray(links)) {
    return '';
  }
  const value = (links as Record<string, unknown>)[key];
  return value ? String(value) : '';
}

function projectToRow(project: ProjectWithRelations): unknown[] {
  const countryName = project.countryName || project.country?.name || '';
  const countryCode = project.countryCode || project.country?.code || '';
  const tagNames = project.tags.map((pt) => pt.tag.name).join('; ');
  const categoryNames = project.categories.length
    ? project.categories.join('; ')
    : project.category?.name || '';

  return [
    project.createdAt.toISOString(),
    project.id,
    project.name,
    project.slug,
    project.status,
    project.published ? 'Yes' : 'No',
    project.verified ? 'Yes' : 'No',
    project.featured ? 'Yes' : 'No',
    project.active ? 'Yes' : 'No',
    countryName,
    countryCode,
    project.city || '',
    project.location || '',
    project.address || '',
    project.category?.name || '',
    categoryNames,
    tagNames,
    project.description,
    project.initiatives || '',
    project.impact || '',
    project.challenges || '',
    project.website || '',
    project.email || '',
    project.foundedYear || '',
    project.logo || '',
    project.acceptsOnchain ? 'Yes' : 'No',
    project.acceptsLightning ? 'Yes' : 'No',
    project.acceptsGiftCards ? 'Yes' : 'No',
    getSocialLink(project.socialLinks, 'twitter'),
    getSocialLink(project.socialLinks, 'linkedin'),
    getSocialLink(project.socialLinks, 'instagram'),
    getSocialLink(project.socialLinks, 'facebook'),
    getSocialLink(project.socialLinks, 'youtube'),
    getSocialLink(project.socialLinks, 'telegram'),
    getSocialLink(project.socialLinks, 'nostr'),
    project.founderName || '',
    project.founderTwitter || '',
    project.founderEmail || '',
    project.user?.name || '',
    project.user?.email || '',
    project.publishedAt?.toISOString() || '',
    project.updatedAt.toISOString(),
  ];
}

export async function exportProjectsToCsv(filters: ExportProjectsFilters): Promise<{
  csv: string;
  count: number;
  filename: string;
}> {
  const projects = await fetchProjectsForExport(filters);
  const rows = projects.map(projectToRow);
  const csv = toCsv(CSV_HEADERS, rows);

  const startLabel = filters.startDate.toISOString().slice(0, 10);
  const endLabel = filters.endDate.toISOString().slice(0, 10);
  const filename = `submitted-projects_${startLabel}_to_${endLabel}.csv`;

  return { csv, count: projects.length, filename };
}
