import { z } from 'zod'
import { COLUMN_COLOR_OPTIONS } from './constants'

export const columnSchema = z.object({
  title: z.string().trim().min(1, 'Введите название колонки').max(50, 'Название слишком длинное'),
  color: z
    .string()
    .optional()
    .refine(
      (color) =>
        color === undefined || COLUMN_COLOR_OPTIONS.some((option) => option.value === color),
      'Неизвестный цвет колонки',
    ),
})

export type ColumnSchemaType = z.infer<typeof columnSchema>
