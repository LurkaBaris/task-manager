import type { COLUMN_COLOR_OPTIONS } from './constants'

export type ColumnColor = (typeof COLUMN_COLOR_OPTIONS)[number]['value']

export interface Column {
  id: string
  title: string
  color: ColumnColor
  order: number
}
