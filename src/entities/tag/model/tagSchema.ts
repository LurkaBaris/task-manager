import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().trim().min(1, 'Введите название тега').max(40, 'Тег слишком длинный'),
});

export type TagSchemaType = z.infer<typeof tagSchema>;
