import { Badge, Button, Group, Paper, Text, Title } from '@mantine/core'
import { columns } from '../model/constants'
import styles from './HomePage.module.css'

export const HomePage = () => {
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
        {columns.map((column) => (
          <Paper
            className={styles.column}
            data-tone={column.tone}
            key={column.title}
            p="md"
            radius="lg"
            withBorder
          >
            <Group className={styles.columnHeader} justify="space-between">
              <div className={styles.columnTitle}>
                <span className={styles.statusDot} aria-hidden="true" />
                <Title order={2}>{column.title}</Title>
              </div>

              <Badge className={styles.counter} variant="light">
                {column.count}
              </Badge>
            </Group>

            <div className={styles.columnBody}>
              <Text className={styles.emptyText} size="sm">
                Пока нет задач
              </Text>
            </div>
          </Paper>
        ))}
      </Group>
    </section>
  )
}
