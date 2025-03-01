import {z} from 'zod';

export const locationSchema = z.object({
  id: z.number(),
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
});

export type Location = z.infer<typeof locationSchema>;
