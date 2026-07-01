import { TaskBoard } from '@/widgets/task-board'
import { Stack, Title } from '@mantine/core'

export const HomePage = () => {
  return (
    <Stack component="section" gap="xl" mih="100%" flex={1}>
      <Title order={1} size="h1" c="gray.9">
        Все задачи
      </Title>

      <TaskBoard />
    </Stack>
  )
}
