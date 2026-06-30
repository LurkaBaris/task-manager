import { ColumnCard, DEFAULT_COLUMNS, type Column } from '@/entities/column'
import { selectTasks, TaskCard, useTaskStore, type Task } from '@/entities/task'
import { CreateTaskButton } from '@/features/create-task'
import { Button, Group, Stack, Title } from '@mantine/core'
import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import styles from './HomePage.module.css'

export const HomePage = () => {
  const tasks = useTaskStore(useShallow(selectTasks))

  const tasksByColumnId = useMemo(() => {
    return tasks.reduce<Map<Column['id'], Task[]>>((acc, task) => {
      const columnTasks = acc.get(task.columnId)

      if (columnTasks) {
        columnTasks.push(task)
      } else {
        acc.set(task.columnId, [task])
      }

      return acc
    }, new Map())
  }, [tasks])

  return (
    <Stack component="section" gap="xl" mih="100%" flex={1}>
      <Group align="center" justify="space-between" gap="md">
        <Title order={1} size="h1" c="gray.9">
          Все задачи
        </Title>

        <Group align="center" gap="md">
          <Button type="button" variant="light">
            Создать колонку
          </Button>

          <CreateTaskButton />
        </Group>
      </Group>

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
                <TaskCard key={task.id} task={task} />
              ))}
            </ColumnCard>
          )
        })}
      </Group>
    </Stack>
  )
}
