import { ColumnCard, type Column } from '@/entities/column'
import { TaskCard, type Task } from '@/entities/task'
import { ColumnTaskSortControl, type TaskSortOrder } from '@/features/change-column-task-sort'
import { DeleteColumnButton } from '@/features/delete-column'
import { DeleteTaskButton } from '@/features/delete-task'
import { EditTaskButton } from '@/features/edit-task'
import {
  DroppableColumn,
  SORTABLE_COLUMN_ID_PREFIX,
  SORTABLE_TASK_ID_PREFIX,
  SortableColumn,
  SortableTask,
} from '@/features/task-dnd'
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Group } from '@mantine/core'
import styles from './TaskBoard.module.css'

interface TaskBoardColumnsProps {
  columns: Column[]
  overColumnId: Task['columnId'] | null
  disabled: boolean
  isTaskDndDisabled: boolean
  hasTasksLoadError: boolean
  isTaskFilterActive: boolean
  normalizedSearch: string
  onRemove: (columnId: Column['id']) => void
  getColumnTasks: (columnId: Column['id']) => Task[]
  getColumnSortOrder: (columnId: Column['id']) => TaskSortOrder
  changeColumnSortOrder: (columnId: Column['id'], sortOrder: TaskSortOrder) => void
}

export const TaskBoardColumns = ({
  columns,
  overColumnId,
  disabled,
  isTaskDndDisabled,
  hasTasksLoadError,
  isTaskFilterActive,
  normalizedSearch,
  getColumnTasks,
  getColumnSortOrder,
  changeColumnSortOrder,
  onRemove,
}: TaskBoardColumnsProps) => {
  return (
    <Group
      align="stretch"
      className={styles.board}
      gap="md"
      grow
      justify="space-between"
      wrap="nowrap"
    >
      <SortableContext
        items={columns.map((column) => `${SORTABLE_COLUMN_ID_PREFIX}${column.id}`)}
        strategy={horizontalListSortingStrategy}
      >
        {columns.map((column) => {
          const sortOrder = getColumnSortOrder(column.id)
          const columnTasks = getColumnTasks(column.id)

          return (
            <SortableColumn column={column} disabled={disabled} key={column.id}>
              <DroppableColumn columnId={column.id}>
                {({ setNodeRef }) => (
                  <ColumnCard
                    column={column}
                    count={columnTasks.length}
                    emptyText={
                      hasTasksLoadError
                        ? 'Задачи не загрузились'
                        : isTaskFilterActive
                          ? 'По данным фильтрам задач не нашлось'
                          : undefined
                    }
                    headerControls={
                      <ColumnTaskSortControl
                        disabled={disabled}
                        sortOrder={sortOrder}
                        onChange={(sortOrder) => changeColumnSortOrder(column.id, sortOrder)}
                      />
                    }
                    topRightAction={
                      <DeleteColumnButton column={column} disabled={disabled} onRemove={onRemove} />
                    }
                    isHightlighted={overColumnId === column.id}
                    listRef={setNodeRef}
                  >
                    <SortableContext
                      items={columnTasks.map((task) => `${SORTABLE_TASK_ID_PREFIX}${task.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnTasks.map((task) => (
                        <SortableTask disabled={isTaskDndDisabled} key={task.id} task={task}>
                          <TaskCard
                            search={normalizedSearch}
                            task={task}
                            actions={
                              <>
                                <DeleteTaskButton task={task} />
                                <EditTaskButton task={task} />
                              </>
                            }
                          />
                        </SortableTask>
                      ))}
                    </SortableContext>
                  </ColumnCard>
                )}
              </DroppableColumn>
            </SortableColumn>
          )
        })}
      </SortableContext>
    </Group>
  )
}
