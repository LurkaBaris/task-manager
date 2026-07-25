import { z } from 'zod';
import { COLUMN_COLOR_VALUES } from './constants';

export const columnSchema = z.object({
  title: z.string().trim().min(1, 'Введите название колонки').max(50, 'Название слишком длинное'),
  color: z.enum(COLUMN_COLOR_VALUES),
});

export type ColumnSchemaType = z.infer<typeof columnSchema>;
