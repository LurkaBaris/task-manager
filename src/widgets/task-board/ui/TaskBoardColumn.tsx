import { ColumnCard, type Column } from '@/entities/column'
import { type Task } from '@/entities/task'
import { ColumnTaskSortControl, type TaskSortOrder } from '@/features/change-column-task-sort'
import { DeleteColumnButton } from '@/features/delete-column'
import { SORTABLE_TASK_ID_PREFIX, SortableColumn } from '@/features/task-dnd'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { memo } from 'react'
import { TaskBoardTask } from './TaskBoardTask'

interface TaskBoardColumnProps {
  column: Column
  columnTasks: Task[]
  sortOrder: TaskSortOrder
  disabled: boolean
  isTaskDndDisabled: boolean
  isTaskFilterActive: boolean
  isHighlighted: boolean
  normalizedSearch: string
  onRemove: (columnId: Column['id']) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  changeColumnSortOrder: (columnId: Column['id'], sortOrder: TaskSortOrder) => void
}

const areTaskListsEqual = (current: Task[], next: Task[]): boolean =>
  current.length === next.length && current.every((task, index) => task === next[index])

const areTaskBoardColumnPropsEqual = (
  current: TaskBoardColumnProps,
  next: TaskBoardColumnProps,
): boolean =>
  current.column === next.column &&
  areTaskListsEqual(current.columnTasks, next.columnTasks) &&
  current.sortOrder === next.sortOrder &&
  current.disabled === next.disabled &&
  current.isTaskDndDisabled === next.isTaskDndDisabled &&
  current.isTaskFilterActive === next.isTaskFilterActive &&
  current.isHighlighted === next.isHighlighted &&
  current.normalizedSearch === next.normalizedSearch &&
  current.onRemove === next.onRemove &&
  current.onEditTask === next.onEditTask &&
  current.onDeleteTask === next.onDeleteTask &&
  current.changeColumnSortOrder === next.changeColumnSortOrder

export const TaskBoardColumn = memo(function TaskBoardColumn({
  column,
  columnTasks,
  sortOrder,
  disabled,
  isTaskDndDisabled,
  isTaskFilterActive,
  isHighlighted,
  normalizedSearch,
  onRemove,
  onEditTask,
  onDeleteTask,
  changeColumnSortOrder,
}: TaskBoardColumnProps) {
  const sortableTaskIds = columnTasks.map((task) => `${SORTABLE_TASK_ID_PREFIX}${task.id}`)

  return (
    <SortableColumn column={column} disabled={disabled}>
      <ColumnCard
        column={column}
        count={columnTasks.length}
        emptyText={isTaskFilterActive ? 'По данным фильтрам задач не нашлось' : undefined}
        headerControls={
          <ColumnTaskSortControl
            disabled={disabled}
            sortOrder={sortOrder}
            onChange={(nextSortOrder) => changeColumnSortOrder(column.id, nextSortOrder)}
          />
        }
        topRightAction={
          <DeleteColumnButton column={column} disabled={disabled} onRemove={onRemove} />
        }
        isHightlighted={isHighlighted}
      >
        <SortableContext items={sortableTaskIds} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskBoardTask
              key={task.id}
              task={task}
              disabled={disabled}
              isTaskDndDisabled={isTaskDndDisabled}
              normalizedSearch={normalizedSearch}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))}
        </SortableContext>
      </ColumnCard>
    </SortableColumn>
  )
}, areTaskBoardColumnPropsEqual)
