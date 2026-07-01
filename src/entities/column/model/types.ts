import type { COLUMN_CONFIG } from './constants'

export type ColumnConfig = (typeof COLUMN_CONFIG)[number]

export type Column = Omit<ColumnConfig, 'color'>
