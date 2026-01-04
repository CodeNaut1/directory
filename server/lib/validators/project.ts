import { z } from 'zod';

/**
 * Project validation schemas - Updated for new data structure
 * Most fields are optional to encourage submissions
 */

export const createProjectSchema = z.object({
  // REQUIRED FIELDS (Essentials only)
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  countryId: z.string().cuid('Invalid country ID'),
  categoryId: z.string().cuid('Invalid category ID'),

  // OPTIONAL BASIC FIELDS
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  coverImage: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  city: z.string().max(100, 'City name is too long').optional(),
  address: z.string().max(500, 'Address is too long').optional(),
  tagIds: z.array(z.string().cuid('Invalid tag ID')).max(6, 'Maximum 6 tags allowed').optional(),

  // OPTIONAL ADDITIONAL FIELDS (New structure)
  foundedYear: z.string().max(4, 'Invalid year format').optional(), // Changed to string for flexibility

  // DETAILED PROJECT INFO
  details: z
    .object({
      // Core descriptions
      longDescription: z.string().max(10000, 'Long description is too long').optional(),
      initiatives: z.string().max(10000, 'Initiatives description is too long').optional(),
      impact: z.string().max(10000, 'Impact description is too long').optional(),
      challenges: z.string().max(10000, 'Challenges description is too long').optional(),

      // Social links
      socialLinks: z
        .object({
          twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
          linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
          facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
          instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
          youtube: z.string().url('Invalid YouTube URL').optional().or(z.literal('')),
          telegram: z.string().url('Invalid Telegram URL').optional().or(z.literal('')),
          nostr: z.string().url('Invalid Nostr URL').optional().or(z.literal('')),
        })
        .optional(),

      // Contact info
      contactEmail: z.string().email('Invalid contact email').max(200).optional(),
      contactPhone: z.string().max(20, 'Phone number is too long').optional(),

      // Bitcoin acceptance
      bitcoinOnly: z.boolean().optional(),
      lightningNetwork: z.boolean().optional(),
      giftCards: z.boolean().optional(),

      // Founder information
      founderName: z.string().max(200, 'Founder name is too long').optional(),
      founderTwitter: z.string().url('Invalid founder Twitter URL').optional().or(z.literal('')),
      founderEmail: z.string().email('Invalid founder email').optional(),

      // Additional metadata
      foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      teamSize: z.string().max(50).optional(),
      fundingStage: z.string().max(100).optional(),
      metaTitle: z.string().max(200).optional(),
      metaDescription: z.string().max(500).optional(),
    })
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const submitProjectSchema = z.object({
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;