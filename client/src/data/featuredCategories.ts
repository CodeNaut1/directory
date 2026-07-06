import {
  Store,
  GraduationCap,
  Recycle,
  Pickaxe,
  Users,
  Newspaper,
  Landmark,
  HandHeart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryCounts {
  businesses: number;
  education: number;
  circularEconomy: number;
  miners: number;
  communities: number;
  media: number;
  hodl: number;
  nonProfit: number;
}

export interface FeaturedCategory {
  key: keyof CategoryCounts;
  label: string;
  slug: string;
  icon: LucideIcon;
  matches: (categoriesStr: string) => boolean;
}

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    key: 'businesses',
    label: 'Businesses',
    slug: 'business',
    icon: Store,
    matches: (s) => s.includes('business'),
  },
  {
    key: 'education',
    label: 'Education',
    slug: 'education',
    icon: GraduationCap,
    matches: (s) => s.includes('education'),
  },
  {
    key: 'circularEconomy',
    label: 'Circular Economy',
    slug: 'circular',
    icon: Recycle,
    matches: (s) => s.includes('circular'),
  },
  {
    key: 'miners',
    label: 'Miners',
    slug: 'mining',
    icon: Pickaxe,
    matches: (s) => s.includes('mining') || s.includes('miner'),
  },
  {
    key: 'communities',
    label: 'Communities',
    slug: 'community',
    icon: Users,
    matches: (s) => s.includes('community'),
  },
  {
    key: 'media',
    label: 'Media',
    slug: 'media',
    icon: Newspaper,
    matches: (s) => s.includes('media') || s.includes('podcast'),
  },
  {
    key: 'hodl',
    label: 'Hodl',
    slug: 'hodl',
    icon: Landmark,
    matches: (s) => s.includes('hodl') || s.includes('hold'),
  },
  {
    key: 'nonProfit',
    label: 'Non-Profit',
    slug: 'non-profit',
    icon: HandHeart,
    matches: (s) => s.includes('non profit') || s.includes('non-profit') || s.includes('nonprofit') || s.includes('charity'),
  },
];

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  FEATURED_CATEGORIES.map((category) => [category.slug, category.label])
);

export function matchesCategory(categoriesStr: string, categorySlug: string): boolean {
  const category = FEATURED_CATEGORIES.find((item) => item.slug === categorySlug);
  if (category) return category.matches(categoriesStr);
  return categoriesStr.includes(categorySlug.toLowerCase());
}

export function countCategories(projects: Array<{ categories?: string[] }>): CategoryCounts {
  const counts: CategoryCounts = {
    businesses: 0,
    education: 0,
    circularEconomy: 0,
    miners: 0,
    communities: 0,
    media: 0,
    hodl: 0,
    nonProfit: 0,
  };

  projects.forEach((project) => {
    const categoriesStr = (project.categories || []).join(' ').toLowerCase();

    FEATURED_CATEGORIES.forEach((category) => {
      if (category.matches(categoriesStr)) {
        counts[category.key]++;
      }
    });
  });

  return counts;
}

export function getCategoryBySlug(slug: string): FeaturedCategory | undefined {
  return FEATURED_CATEGORIES.find((category) => category.slug === slug);
}
