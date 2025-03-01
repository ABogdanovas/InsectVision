import {z} from 'zod';
import {locationSchema} from './Location';

export const insectSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  name: z.string(),
  is_danger: z.boolean(),
  danger_description: z.string().nullable(),
  description: z.string(),
  photo_url: z.string(),
  locations: locationSchema.array().optional(),
  habitat: z.string(),
});

export type Insect = z.infer<typeof insectSchema>;
