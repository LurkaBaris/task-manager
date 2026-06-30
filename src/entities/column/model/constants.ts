import type { Column } from './types'

export const DEFAULT_COLUMNS = [
  {
    id: 'todo',
    title: 'К выполнению',
    order: 1,
  },
  {
    id: 'inProgress',
    title: 'В работе',
    order: 2,
  },
  {
    id: 'done',
    title: 'Готово',
    order: 3,
  },
] as Column[]
