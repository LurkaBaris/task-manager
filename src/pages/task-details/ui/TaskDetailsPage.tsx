import { selectTasks, taskDateFormatter, useTaskStore } from '@/entities/task'
import { ChangeTaskDescriptionInline } from '@/features/change-task-description'
import { ChangeTaskPrioritySelect } from '@/features/change-task-priority'
import { ChangeTaskStatusSelect } from '@/features/change-task-status'
import { ChangeTaskTag } from '@/features/change-task-tag'
import { ChangeTaskTitleInline } from '@/features/change-task-title'
import { ChangeTaskType } from '@/features/change-task-type'
import { DeleteTaskButton } from '@/features/delete-task'
import { getTaskDetailsRoute, ROUTES } from '@/shared/config'
import { TaskComments } from '@/widgets/task-comments'
import { Alert, Box, Center, Divider, Grid, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/shallow'
import styles from './TaskDetailsPage.module.css'

export const TaskDetailsPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const {
    tasksByColumnId,
    isLoading: isTasksLoading,
    isLoaded: isTasksLoaded,
  } = useTaskStore(useShallow(selectTasks))

  const task = useMemo(() => {
    if (!taskId) return undefined

    return Object.values(tasksByColumnId)
      .flatMap((columnTasks) => columnTasks ?? [])
      .find((task) => task.id === taskId)
  }, [taskId, tasksByColumnId])

  const isInitialLoading = isTasksLoading && !isTasksLoaded

  if (isInitialLoading) {
    return (
      <Center h={240}>
        <Loader size="sm" />
      </Center>
    )
  }

  if (!task) {
    return (
      <Alert color="yellow" title="Задача не найдена">
        Такой задачи нет или она удалена
      </Alert>
    )
  }

  const createdAt = taskDateFormatter.format(new Date(task.createdAt))

  return (
    <Stack className={styles.page} gap="md">
      <Paper bg="white" p={{ base: 'md', sm: 'lg', md: 'xl' }} radius="lg" shadow="none" withBorder>
        <Stack gap="xl">
          <Group align="flex-start" gap="md" justify="space-between" wrap="nowrap">
            <Box miw={0} w="100%">
              <ChangeTaskTitleInline task={task} />
            </Box>

            <DeleteTaskButton
              task={task}
              iconSize={16}
              size={36}
              variant="light"
              onDeleted={() => navigate(ROUTES.HOME, { flushSync: true, replace: true })}
              onRestored={() =>
                navigate(getTaskDetailsRoute(task.id), { flushSync: true, replace: true })
              }
            />
          </Group>

          <Grid align="stretch" gap={{ base: 'xl', md: 32 }}>
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
              <Box bg="gray.0" className={styles.metaPanel} p="md">
                <Stack gap="md">
                  <Text c="gray.9" component="h2" fw={700} m={0} size="sm">
                    Сведения
                  </Text>

                  <Box className={styles.fields}>
                    <Box className={styles.field}>
                      <Text c="gray.6" fw={650} size="sm">
                        Статус:
                      </Text>
                      <ChangeTaskStatusSelect task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text c="gray.6" fw={650} size="sm">
                        Приоритет:
                      </Text>
                      <ChangeTaskPrioritySelect task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text c="gray.6" fw={650} size="sm">
                        Тип:
                      </Text>
                      <ChangeTaskType task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text c="gray.6" fw={650} size="sm">
                        Тег:
                      </Text>
                      <ChangeTaskTag task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text c="gray.6" fw={650} size="sm">
                        Создано:
                      </Text>
                      <Text c="gray.8" fw={500} size="sm">
                        {createdAt}
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
              <Stack className={styles.section} component="section" gap="xs">
                <Text c="gray.9" component="h2" fw={700} m={0} size="sm">
                  Описание
                </Text>

                <ChangeTaskDescriptionInline task={task} />
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider color="gray.2" />

          <TaskComments taskId={task.id} />
        </Stack>
      </Paper>
    </Stack>
  )
}
