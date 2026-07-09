import { ColumnCard, type Column } from '@/entities/column'
import { TaskCard, type Task } from '@/entities/task'
import { ColumnTaskSortControl, type TaskSortOrder } from '@/features/change-column-task-sort'
import { ChangeTaskPrioritySelect } from '@/features/change-task-priority'
import { ChangeTaskStatusSelect } from '@/features/change-task-status'
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
import { useRef, useState, type UIEvent, type WheelEvent } from 'react'
import { getTaskCardActions } from '../lib/getTaskCardActions'
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

// TODO: фича спорная, чтобы по wheel давать по горизонтали скроллить
// так как отключается дефолтная физика браузера
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
  const boardRef = useRef<HTMLDivElement | null>(null)
  const topScrollbarRef = useRef<HTMLDivElement | null>(null)

  const [boardScrollWidth, setBoardScrollWidth] = useState(0)

  const syncTopScrollbarWidth = () => {
    const board = boardRef.current

    if (!board) {
      return
    }

    setBoardScrollWidth(board.scrollWidth)
  }

  const handleTopScrollbarScroll = (event: UIEvent<HTMLDivElement>) => {
    const board = boardRef.current

    if (!board) {
      return
    }

    board.scrollLeft = event.currentTarget.scrollLeft
  }

  const handleBoardScroll = (event: UIEvent<HTMLDivElement>) => {
    const topScrollbar = topScrollbarRef.current

    if (!topScrollbar) {
      return
    }

    topScrollbar.scrollLeft = event.currentTarget.scrollLeft
  }

  const isScrollableY = (element: HTMLElement): boolean => {
    const { overflowY } = window.getComputedStyle(element)

    return (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      element.scrollHeight > element.clientHeight
    )
  }

  const findScrollableYParent = (target: HTMLElement, root: HTMLElement): HTMLElement | null => {
    let element: HTMLElement | null = target

    while (element && element !== root) {
      if (isScrollableY(element)) {
        return element
      }

      element = element.parentElement
    }

    return null
  }

  const getBoardScrollDelta = (event: WheelEvent<HTMLDivElement>): number => {
    return Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  }

  const handleBoardWheel = (event: WheelEvent<HTMLDivElement>) => {
    const board = boardRef.current
    const target = event.target

    if (!board || !(target instanceof HTMLElement)) {
      return
    }

    const scrollableYParent = findScrollableYParent(target, board)

    if (scrollableYParent) {
      return
    }

    board.scrollLeft += getBoardScrollDelta(event)
  }

  return (
    <div className={styles.boardWrapper}>
      <div
        ref={topScrollbarRef}
        className={styles.topScrollbar}
        onScroll={handleTopScrollbarScroll}
      >
        <div style={{ width: boardScrollWidth }} />
      </div>

      <Group
        align="stretch"
        className={styles.board}
        gap="md"
        justify="space-between"
        wrap="nowrap"
        ref={(node) => {
          boardRef.current = node
          syncTopScrollbarWidth()
        }}
        onScroll={handleBoardScroll}
        onWheel={handleBoardWheel}
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
                        <DeleteColumnButton
                          column={column}
                          disabled={disabled}
                          onRemove={onRemove}
                        />
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
                              headerActions={
                                <>
                                  <DeleteTaskButton task={task} data-no-dnd />
                                  <EditTaskButton task={task} data-no-dnd />
                                </>
                              }
                              metaItems={getTaskCardActions({ task, disabled })}
                              footerActions={
                                <>
                                  <ChangeTaskStatusSelect task={task} disabled={disabled} />

                                  <ChangeTaskPrioritySelect task={task} disabled={disabled} />
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
    </div>
  )
}
