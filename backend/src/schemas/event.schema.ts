import { z } from 'zod';

export const CreateEventSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  title: z.string().min(1, 'Titre requis').max(200, 'Maximum 200 caracteres'),
  description: z.string().max(1000, 'Maximum 1000 caracteres').optional(),
});

export const UpdateEventSchema = z.object({
  date: z.string().transform((str) => new Date(str)).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
