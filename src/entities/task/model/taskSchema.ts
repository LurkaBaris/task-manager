import { z } from 'zod'
import { TASK_PRIORITIES } from './constants'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Введите название задачи').max(120, 'Заголовок слишком длинный'),
  description: z.string().trim().max(500, 'Описание слишком длинное'),
  columnId: z.string().trim().min(1, 'Выберите колонку'),
  priority: z.enum(TASK_PRIORITIES),
})

export type TaskSchemaType = z.infer<typeof taskSchema>
