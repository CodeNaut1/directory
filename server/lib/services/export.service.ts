/**
 * Export service — CSV export of submitted projects
 * Column order matches Google Sheets sync (googleSheets.ts appendToSheet)
 */

import { prisma } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';
import { toCsv } from '@/lib/utils/csv';

export interface ExportProjectsFilters {
  startDate: Date;
  endDate: Date;
  status?: ProjectStatus;
}

type ProjectWithRelations = Awaited<ReturnType<typeof fetchProjectsForExport>>[number];

/** Matches Google Sheets "Live Directory Entries" column order (A–T) */
const CSV_HEADERS = [
  'DATE',
  'PROJECT NAME',
  'COUNTRY',
  'CATEGORY',
  'TAGS',
  'BITCOIN ACCEPTANCE',
  'SHORT DESCRIPTION',
  'LONG DESCRIPTION',
  'CORE INITIATIVES',
  'IMPACT & ACHIEVEMENTS',
  'CHALLENGES',
  'WEBSITE',
  'EMAIL',
  'PHONE',
  'PROJECT SOCIALS',
  'FOUNDER NAME',
  'FOUNDER TWITTER',
  'FOUNDER EMAIL',
  'YEAR FOUNDED',
  'SUBMITTED BY',
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

function formatSubmittedAt(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buildBitcoinAcceptance(project: ProjectWithRelations): string {
  const parts: string[] = [];
  if (project.acceptsOnchain) parts.push('Bitcoin Onchain');
  if (project.acceptsLightning) parts.push('Lightning Network');
  if (project.acceptsGiftCards) parts.push('Gift Cards');
  return parts.length > 0 ? parts.join(', ') : 'None';
}

function getSocialLink(links: unknown, key: string): string {
  if (!links || typeof links !== 'object' || Array.isArray(links)) {
    return '';
  }
  const value = (links as Record<string, unknown>)[key];
  return value ? String(value) : '';
}

function buildProjectSocials(project: ProjectWithRelations): string {
  const links = project.socialLinks;
  const socials: string[] = [];
  const twitter = getSocialLink(links, 'twitter');
  const linkedin = getSocialLink(links, 'linkedin');
  const facebook = getSocialLink(links, 'facebook');
  const youtube = getSocialLink(links, 'youtube');
  const telegram = getSocialLink(links, 'telegram');
  const nostr = getSocialLink(links, 'nostr');
  const instagram = getSocialLink(links, 'instagram');

  if (twitter) socials.push(`Twitter: ${twitter}`);
  if (linkedin) socials.push(`LinkedIn: ${linkedin}`);
  if (facebook) socials.push(`Facebook: ${facebook}`);
  if (youtube) socials.push(`YouTube: ${youtube}`);
  if (telegram) socials.push(`Telegram: ${telegram}`);
  if (nostr) socials.push(`Nostr: ${nostr}`);
  if (instagram) socials.push(`Instagram: ${instagram}`);

  return socials.join('\n');
}

function projectToRow(project: ProjectWithRelations): unknown[] {
  const countryName = project.countryName || project.country?.name || '';
  const categoryName = project.category?.name || project.categories[0] || '';
  const tagNames = project.tags.map((pt) => pt.tag.name).join(', ');

  return [
    formatSubmittedAt(project.createdAt),
    project.name,
    countryName,
    categoryName,
    tagNames,
    buildBitcoinAcceptance(project),
    project.description,
    '', // longDescription not stored in DB after schema change
    project.initiatives || '',
    project.impact || '',
    project.challenges || '',
    project.website || '',
    project.email || '',
    '', // phone not stored in DB after schema change
    buildProjectSocials(project),
    project.founderName || '',
    project.founderTwitter || '',
    project.founderEmail || '',
    project.foundedYear || '',
    project.user?.email || '',
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
