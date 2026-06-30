import { DEFAULT_COLUMNS, type Column } from '@/entities/column'
import { z } from 'zod'

const columnIds = DEFAULT_COLUMNS.map((column) => column.id) as [Column['id'], ...Column['id'][]]

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Введите название задачи').max(120, 'Заголовок слишком длинный'),
  description: z.string().trim().max(500, 'Описание слишком длинное'),
  columnId: z.enum(columnIds),
  priority: z.enum(['low', 'medium', 'high']),
})

export type CreateTaskSchemaType = z.infer<typeof createTaskSchema>
