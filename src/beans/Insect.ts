import {z} from 'zod';
import {locationSchema} from './Location';

export const insectSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  name: z.string(),
  danger_description: z.string().nullable(),
  description: z.string(),
  photo_urls: z.string().array(),
  locations: locationSchema.array().optional(),
  habitat: z.string(),
  is_danger: z.boolean(),
  is_biting: z.boolean(),
  is_endangered: z.boolean(),
  is_flying: z.boolean(),
  is_parasite: z.boolean(),
  is_poisonous: z.boolean(),
});

export type Insect = z.infer<typeof insectSchema>;
