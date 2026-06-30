export type ColumnId = 'todo' | 'inProgress' | 'done'

export interface Column {
  id: ColumnId
  title: string
}
