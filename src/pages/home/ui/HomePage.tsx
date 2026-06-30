import { ColumnCard, DEFAULT_COLUMNS, type Column } from '@/entities/column'
import { TaskCard, type Task } from '@/entities/task'
import { Button, Group, Title } from '@mantine/core'
import { tasks } from '../model/tasks'
import styles from './HomePage.module.css'

export const HomePage = () => {
  const tasksByColumnId = tasks.reduce<Map<Column['id'], Task[]>>((acc, task) => {
    const columnTasks = acc.get(task.columnId)

    if (columnTasks) {
      columnTasks.push(task)
    } else {
      acc.set(task.columnId, [task])
    }

    return acc
  }, new Map())

  return (
    <section className={styles.section}>
      <Group align="center" className={styles.heading} justify="space-between">
        <Title className={styles.title} order={1}>
          Все задачи
        </Title>

        <Group align="center" gap="md">
          {/* TODO: сделать в будущем как фичу */}
          <Button className={styles.createButton} color="teal" type="button" variant="light">
            Создать колонку
          </Button>

          <Button className={styles.createButton} color="teal" type="button">
            Создать задачу
          </Button>
        </Group>
      </Group>

      <Group
        align="stretch"
        className={styles.board}
        gap="md"
        grow
        justify="space-between"
        wrap="nowrap"
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
    </section>
  )
}
