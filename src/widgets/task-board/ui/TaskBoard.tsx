import { ColumnCard, DEFAULT_COLUMNS } from '@/entities/column'
import {
  selectTasks,
  TASK_PRIORITY_OPTIONS,
  TaskCard,
  useTaskActions,
  useTaskStore,
  type TaskPriority,
} from '@/entities/task'
import { CreateTaskButton } from '@/features/create-task'
import { DeleteTaskButton } from '@/features/delete-task'
import { EditTaskButton } from '@/features/edit-task'
import {
  Button,
  Flex,
  Group,
  MultiSelect,
  Paper,
  Pill,
  Skeleton,
  Stack,
  TextInput,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './TaskBoard.module.css'

const VISIBLE_PRIORITY_PILLS_COUNT = 2
const LOADING_COLUMN_TASKS_COUNT = 3

export const TaskBoard = () => {
  const [search, setSearch] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [hasLoadError, setHasLoadError] = useState(false)
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const { tasksByColumnId, isLoading, isLoaded } = useTaskStore(useShallow(selectTasks))
  const { loadTasksByColumnIds } = useTaskActions()
  const normalizedSearch = debouncedSearch.toLowerCase().trim()
  const isInitialLoading = isLoading && !isLoaded
  const isBoardLocked = !isLoaded

  const visibleTasksByColumnId = useMemo(
    () =>
      new Map(
        DEFAULT_COLUMNS.map((column) => {
          const columnTasks = tasksByColumnId[column.id] ?? []
          const visibleTasks = columnTasks
            .filter((task) => {
              const matchesSearch =
                normalizedSearch.length === 0 ||
                task.title.toLowerCase().includes(normalizedSearch) ||
                task.description.toLowerCase().includes(normalizedSearch)

              const matchesPriority =
                selectedPriorities.length === 0 || selectedPriorities.includes(task.priority)

              return matchesSearch && matchesPriority
            })
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

          return [column.id, visibleTasks]
        }),
      ),
    [tasksByColumnId, normalizedSearch, selectedPriorities],
  )

  useEffect(() => {
    const load = async () => {
      try {
        setHasLoadError(false)
        await loadTasksByColumnIds(DEFAULT_COLUMNS.map((column) => column.id))
      } catch {
        setHasLoadError(true)

        notifications.show({
          title: 'Не удалось загрузить задачи',
          message: 'Попробуйте обновить страницу',
          color: 'red',
        })
      }
    }

    void load()
  }, [loadTasksByColumnIds])

  return (
    <>
      <Flex align="center" gap="md" className={styles.toolbar}>
        <TextInput
          className={styles.searchInput}
          disabled={isBoardLocked}
          leftSection={<Search size={16} strokeWidth={2} />}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Поиск по задачам"
          value={search}
        />

        <MultiSelect<TaskPriority>
          className={styles.prioritySelect}
          styles={{
            input: {
              overflow: 'hidden',
            },

            pillsList: {
              flexWrap: 'nowrap',
              maxWidth: '100%',
              overflowX: 'hidden',
              overflowY: 'hidden',
            },
          }}
          clearable
          data={TASK_PRIORITY_OPTIONS}
          disabled={isBoardLocked}
          onChange={(values) => setSelectedPriorities(values)}
          placeholder={selectedPriorities.length === 0 ? 'Приоритеты' : undefined}
          renderPill={({ value, option, onRemove, disabled }) => {
            const priorityIndex = selectedPriorities.findIndex((priority) => priority === value)

            if (priorityIndex >= VISIBLE_PRIORITY_PILLS_COUNT) {
              if (priorityIndex === VISIBLE_PRIORITY_PILLS_COUNT) {
                return (
                  <Pill disabled={disabled}>
                    +{selectedPriorities.length - VISIBLE_PRIORITY_PILLS_COUNT}
                  </Pill>
                )
              }

              return null
            }

            return (
              <Pill disabled={disabled} onRemove={onRemove} withRemoveButton={!disabled}>
                {option?.label ?? value}
              </Pill>
            )
          }}
          value={selectedPriorities}
        />

        <Button disabled={isBoardLocked} type="button" variant="light">
          Создать колонку
        </Button>

        <CreateTaskButton disabled={isBoardLocked} />
      </Flex>

      {isInitialLoading ? (
        <Group
          align="stretch"
          aria-busy="true"
          aria-label="Загрузка задач"
          className={styles.board}
          gap="md"
          grow
          justify="space-between"
          wrap="nowrap"
        >
          {DEFAULT_COLUMNS.map((column) => (
            <Paper
              className={styles.loadingColumn}
              h="calc(100vh - 100px)"
              key={column.id}
              mah="1000px"
              mih="420px"
              miw="240px"
              radius="lg"
            >
              <Flex direction="column" h="100%">
                <Group justify="space-between" wrap="nowrap" pb={22} pt="lg" px="md">
                  <Skeleton h={20} radius="xl" w="45%" />
                  <Skeleton h={24} radius="xl" w={32} />
                </Group>

                <Stack gap="sm" px="md">
                  {Array.from({ length: LOADING_COLUMN_TASKS_COUNT }, (_, index) => (
                    <Stack className={styles.loadingTask} gap="xs" key={index}>
                      <Skeleton h={16} radius="xl" w="75%" />
                      <Skeleton h={12} radius="xl" w="100%" />
                      <Skeleton h={12} radius="xl" w="58%" />
                    </Stack>
                  ))}
                </Stack>
              </Flex>
            </Paper>
          ))}
        </Group>
      ) : (
        <Group
          align="stretch"
          gap="md"
          grow
          justify="space-between"
          wrap="nowrap"
          className={styles.board}
        >
          {DEFAULT_COLUMNS.map((column) => {
            const columnTasks = visibleTasksByColumnId.get(column.id) ?? []

            return (
              <ColumnCard
                column={column}
                count={columnTasks.length}
                emptyText={hasLoadError ? 'Задачи не загрузились' : undefined}
                key={column.id}
              >
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    search={normalizedSearch}
                    task={task}
                    actions={
                      <>
                        <DeleteTaskButton task={task} />
                        <EditTaskButton task={task} />
                      </>
                    }
                  />
                ))}
              </ColumnCard>
            )
          })}
        </Group>
      )}
    </>
  )
}
