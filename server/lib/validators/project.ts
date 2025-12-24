import { z } from 'zod';

/**
 * Project validation schemas
 */

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  coverImage: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  countryId: z.string().cuid('Invalid country ID'),
  categoryId: z.string().cuid('Invalid category ID'),
  city: z.string().max(100, 'City name is too long').optional(),
  address: z.string().max(500, 'Address is too long').optional(),
  tagIds: z.array(z.string().cuid('Invalid tag ID')).optional(),
  details: z
    .object({
      longDescription: z.string().max(10000, 'Long description is too long').optional(),
      socialLinks: z
        .record(z.string().url('Invalid social link URL'))
        .optional(),
      contactEmail: z.string().email('Invalid contact email').optional(),
      contactPhone: z.string().max(20, 'Phone number is too long').optional(),
      foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      teamSize: z.string().max(50).optional(),
      fundingStage: z.string().max(100).optional(),
      bitcoinOnly: z.boolean().optional(),
      lightningNetwork: z.boolean().optional(),
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

