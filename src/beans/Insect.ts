import {z} from 'zod';

export const InsectSchema = z.object({
  id: z.number(),
  category_id: z.number(),
  name: z.string(),
  is_danger: z.boolean(),
  danger_description: z.string().nullable(),
  description: z.string(),
  photo_url: z.string(),
  location: z.string(),
  habitat: z.string(),
});

export type Insect = z.infer<typeof InsectSchema>;
