import { ColumnCard, DEFAULT_COLUMNS, type Column } from '@/entities/column'
import {
  selectTasks,
  TASK_PRIORITY_OPTIONS,
  TaskCard,
  useTaskStore,
  type Task,
  type TaskPriority,
} from '@/entities/task'
import { CreateTaskButton } from '@/features/create-task'
import { DeleteTaskButton } from '@/features/delete-task'
import { EditTaskButton } from '@/features/edit-task'
import { Button, Flex, Group, MultiSelect, Pill, TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './TaskBoard.module.css'

const VISIBLE_PRIORITY_PILLS_COUNT = 2

export const TaskBoard = () => {
  const [search, setSearch] = useState('')
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([])
  const [debouncedSearch] = useDebouncedValue(search, 300)
  const tasks = useTaskStore(useShallow(selectTasks))
  const normalizedSearch = debouncedSearch.toLowerCase().trim()

  const tasksByColumnId = useMemo(() => {
    const reducedTasks = tasks.reduce<Map<Column['id'], Task[]>>((acc, task) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch)

      const matchesPriority =
        selectedPriorities.length === 0 || selectedPriorities.includes(task.priority)

      if (!matchesSearch || !matchesPriority) {
        return acc
      }

      const columnTasks = acc.get(task.columnId)

      if (columnTasks) {
        columnTasks.push(task)
      } else {
        acc.set(task.columnId, [task])
      }

      return acc
    }, new Map())

    reducedTasks.forEach((columnTasks) => {
      columnTasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    })

    return reducedTasks
  }, [tasks, normalizedSearch, selectedPriorities])

  return (
    <>
      <Flex align="center" gap="md" className={styles.toolbar}>
        <TextInput
          className={styles.searchInput}
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

        <Button type="button" variant="light">
          Создать колонку
        </Button>

        <CreateTaskButton />
      </Flex>

      <Group
        align="stretch"
        gap="md"
        grow
        justify="space-between"
        wrap="nowrap"
        className={styles.board}
      >
        {DEFAULT_COLUMNS.map((column) => {
          const columnTasks = tasksByColumnId.get(column.id) ?? []

          return (
            <ColumnCard column={column} count={columnTasks.length} key={column.id}>
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
    </>
  )
}
