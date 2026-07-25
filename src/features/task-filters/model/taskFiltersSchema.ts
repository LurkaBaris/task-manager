import { TASK_PRIORITIES, TASK_TYPES } from '@/entities/task';
import { z } from 'zod';

export const taskFiltersSchema = z.object({
  priorities: z.array(z.enum(TASK_PRIORITIES)),
  types: z.array(z.enum(TASK_TYPES)),
  tagIds: z.array(z.string().trim().min(1, 'Некорректный тег')),
});

export type TaskFiltersSchemaType = z.infer<typeof taskFiltersSchema>;
