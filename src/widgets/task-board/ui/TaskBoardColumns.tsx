import { type Column } from '@/entities/column'
import { type Task } from '@/entities/task'
import { type TaskSortOrder } from '@/features/change-column-task-sort'
import { SORTABLE_COLUMN_ID_PREFIX } from '@/features/task-dnd'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Group } from '@mantine/core'
import { useRef, useState, type UIEvent, type WheelEvent } from 'react'
import styles from './TaskBoard.module.css'
import { TaskBoardColumn } from './TaskBoardColumn'

interface TaskBoardColumnsProps {
  columns: Column[]
  overColumnId: Task['columnId'] | null
  disabled: boolean
  isTaskDndDisabled: boolean
  isTaskFilterActive: boolean
  normalizedSearch: string
  onRemove: (columnId: Column['id']) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
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
  isTaskFilterActive,
  normalizedSearch,
  getColumnTasks,
  getColumnSortOrder,
  changeColumnSortOrder,
  onRemove,
  onEditTask,
  onDeleteTask,
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
              <TaskBoardColumn
                changeColumnSortOrder={changeColumnSortOrder}
                column={column}
                columnTasks={columnTasks}
                disabled={disabled}
                isHighlighted={overColumnId === column.id}
                isTaskDndDisabled={isTaskDndDisabled}
                isTaskFilterActive={isTaskFilterActive}
                key={column.id}
                normalizedSearch={normalizedSearch}
                sortOrder={sortOrder}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onRemove={onRemove}
              />
            )
          })}
        </SortableContext>
      </Group>
    </div>
  )
}
