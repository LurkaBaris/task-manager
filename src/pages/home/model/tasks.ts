import type { Task } from '@/entities/task'

export const tasks: Task[] = [
  {
    id: 'task-1',
    columnId: 'todo',
    title: 'Подготовить компоненты задачи',
    description: 'Собрать базовую карточку, статус и приоритет для списка задач.',
    createdAt: '2026-06-30T10:00:00.000Z',
    status: 'todo',
    priority: 'high',
  },
  {
    id: 'task-2',
    columnId: 'inProgress',
    title: 'Настроить страницу доски',
    description: 'Разложить задачи по колонкам и проверить высоту рабочей области.',
    createdAt: '2026-06-30T11:30:00.000Z',
    status: 'inProgress',
    priority: 'medium',
  },
  {
    id: 'task-3',
    columnId: 'done',
    title: 'Подключить Mantine',
    description: 'Добавить провайдер, тему и базовые стили приложения.',
    createdAt: '2026-06-29T15:20:00.000Z',
    status: 'done',
    priority: 'low',
  },
]
