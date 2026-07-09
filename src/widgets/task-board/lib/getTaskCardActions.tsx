import type { Task } from '@/entities/task'
import { ChangeTaskTag } from '@/features/change-task-tag'
import { ChangeTaskType } from '@/features/change-task-type'

interface TaskCardActionsProps {
  task: Task
  disabled: boolean
}

export const getTaskCardActions = ({ task, disabled }: TaskCardActionsProps) => [
  {
    label: 'Тег',
    content: <ChangeTaskTag task={task} disabled={disabled} />,
  },
  {
    label: 'Тип',
    content: <ChangeTaskType task={task} disabled={disabled} />,
  },
]
