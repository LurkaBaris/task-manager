import type { Column } from './types'

export const COLUMN_CONFIG = [
  { id: 'todo', title: 'К выполнению', color: 'statusTodo' },
  { id: 'inProgress', title: 'В работе', color: 'statusProgress' },
  { id: 'done', title: 'Готово', color: 'statusDone' },
] as const

export const DEFAULT_COLUMNS: Column[] = COLUMN_CONFIG.map(({ id, title }) => ({
  id,
  title,
}))

export const COLUMN_TITLE_BY_ID = Object.fromEntries(
  COLUMN_CONFIG.map(({ id, title }) => [id, title]),
) as Record<Column['id'], string>

export const COLUMN_COLOR_BY_ID = Object.fromEntries(
  COLUMN_CONFIG.map(({ id, color }) => [id, color]),
) as Record<Column['id'], string>
