export const TASK_POSITION_STEP = 1000

export const COLUMN_ORDER_STEP = 1000

export const DEFAULT_COLUMN_COLOR = 'brand'
export const DEFAULT_TYPE = 'task'

export const COLUMN_COLOR_OPTIONS = [
  { value: 'brand', label: 'Бирюзовый' },
  { value: 'accent', label: 'Оранжевый' },
  { value: 'statusTodo', label: 'Синий' },
  { value: 'statusProgress', label: 'Желтый' },
  { value: 'statusDone', label: 'Зеленый' },
  { value: 'priorityHigh', label: 'Красный' },
] as const

export const DEFAULT_COLUMNS = [
  { id: 'todo', title: 'К выполнению', color: 'statusTodo', order: 1000 },
  { id: 'inProgress', title: 'В работе', color: 'statusProgress', order: 2000 },
  { id: 'done', title: 'Готово', color: 'statusDone', order: 3000 },
] as const
