import { selectColumns, useColumnActions, useColumnStore } from '@/entities/column'
import {
  selectTasks,
  TaskCard,
  useTaskActions,
  useTaskStore,
  type TaskPriority,
} from '@/entities/task'
import {
  sortTasksBySortOrder,
  TASK_SORT_ORDER,
  useColumnTaskSort,
} from '@/features/change-column-task-sort'
import { CreateColumnButton } from '@/features/create-column'
import { TaskDndProvider } from '@/features/task-dnd'
import { Alert, Paper, Stack, Text, Title } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { TaskBoardSkeleton } from './TaskBoardSkeleton'
import { TaskBoardToolbar } from './TaskBoardToolbar'
import { TaskBoardColumns } from './TaskBoardColumns'

export const TaskBoard = () => {
  const [search, setSearch] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [hasColumnsLoadError, setHasColumnsLoadError] = useState(false)
  const [hasTasksLoadError, setHasTasksLoadError] = useState(false)
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const { columns, isLoaded: isColumnsLoaded } = useColumnStore(useShallow(selectColumns))
  const { loadColumns } = useColumnActions()
  const { tasksByColumnId, isLoading, isLoaded } = useTaskStore(useShallow(selectTasks))
  const { loadTasksByColumnIds } = useTaskActions()
  const { changeColumnSortOrder, getColumnSortOrder, removeColumnSortOrder } = useColumnTaskSort()
  const columnIds = useMemo(() => columns.map((column) => column.id), [columns])

  const hasColumns = columns.length > 0
  const normalizedSearch = debouncedSearch.toLowerCase().trim()
  const isTasksReady = !hasColumns || isLoaded
  const isInitialLoading =
    !hasColumnsLoadError && (!isColumnsLoaded || (hasColumns && isLoading && !isLoaded))
  const isBoardLocked = !isColumnsLoaded || !isTasksReady || hasColumnsLoadError
  const isCreateTaskDisabled = isBoardLocked || !hasColumns
  const isTaskFilterActive = normalizedSearch.length > 0 || selectedPriorities.length > 0
  const isTaskDndDisabled = isBoardLocked || isTaskFilterActive

  const visibleTasksByColumnId = useMemo(
    () =>
      new Map(
        columns.map((column) => {
          const columnTasks = tasksByColumnId[column.id] ?? []

          const visibleTasks = columnTasks.filter((task) => {
            const matchesSearch =
              normalizedSearch.length === 0 ||
              task.title.toLowerCase().includes(normalizedSearch) ||
              task.description.toLowerCase().includes(normalizedSearch)

            const matchesPriority =
              selectedPriorities.length === 0 || selectedPriorities.includes(task.priority)

            return matchesSearch && matchesPriority
          })

          return [column.id, visibleTasks]
        }),
      ),
    [columns, tasksByColumnId, normalizedSearch, selectedPriorities],
  )

  useEffect(() => {
    const load = async () => {
      try {
        setHasColumnsLoadError(false)

        await loadColumns()
      } catch {
        setHasColumnsLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить колонки',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [loadColumns])

  useEffect(() => {
    if (!isColumnsLoaded || hasColumnsLoadError || !hasColumns) {
      return
    }

    const load = async () => {
      try {
        setHasTasksLoadError(false)

        await loadTasksByColumnIds(columnIds)
      } catch {
        setHasTasksLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить задачи',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    load()
  }, [isColumnsLoaded, hasColumnsLoadError, hasColumns, columnIds, loadTasksByColumnIds])

  return (
    <>
      <TaskBoardToolbar
        disabled={isBoardLocked}
        isCreateTaskDisabled={isCreateTaskDisabled}
        search={search}
        selectedPriorities={selectedPriorities}
        onSearchChange={setSearch}
        onSelectedPrioritiesChange={setSelectedPriorities}
      />

      {hasColumnsLoadError ? (
        <Alert color="red" title="Не удалось загрузить колонки">
          Попробуйте обновить страницу
        </Alert>
      ) : isInitialLoading ? (
        <TaskBoardSkeleton columnsCount={columns.length || 3} />
      ) : !hasColumns ? (
        <Paper p="xl" radius="lg" withBorder>
          <Stack align="center" gap="md">
            <Title order={3}>Пока нет колонок</Title>

            <Text c="dimmed" ta="center">
              Создайте первую колонку, чтобы начать работу с задачами.
            </Text>

            <CreateColumnButton variant="filled" />
          </Stack>
        </Paper>
      ) : (
        <TaskDndProvider
          columns={columns}
          disabled={isTaskDndDisabled}
          getColumnTasks={(columnId) =>
            sortTasksBySortOrder(
              visibleTasksByColumnId.get(columnId) ?? [],
              getColumnSortOrder(columnId),
            )
          }
          isColumnManual={(columnId) => getColumnSortOrder(columnId) === TASK_SORT_ORDER.Manual}
          setColumnManual={(columnId) => changeColumnSortOrder(columnId, TASK_SORT_ORDER.Manual)}
          renderOverlay={(task) => <TaskCard task={task} />}
        >
          {({ overColumnId, getColumnTasks }) => (
            <TaskBoardColumns
              columns={columns}
              overColumnId={overColumnId}
              disabled={isBoardLocked}
              isTaskDndDisabled={isTaskDndDisabled}
              hasTasksLoadError={hasTasksLoadError}
              isTaskFilterActive={isTaskFilterActive}
              normalizedSearch={normalizedSearch}
              getColumnTasks={getColumnTasks}
              getColumnSortOrder={getColumnSortOrder}
              changeColumnSortOrder={changeColumnSortOrder}
              onRemove={removeColumnSortOrder}
            />
          )}
        </TaskDndProvider>
      )}
    </>
  )
}
