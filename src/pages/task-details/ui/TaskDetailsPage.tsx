import { selectTasks, taskDateFormatter, useTaskStore } from '@/entities/task';
import { ChangeTaskDescriptionInline } from '@/features/change-task-description';
import { ChangeTaskPrioritySelect } from '@/features/change-task-priority';
import { ChangeTaskStatusSelect } from '@/features/change-task-status';
import { ChangeTaskTag } from '@/features/change-task-tag';
import { ChangeTaskTitleInline } from '@/features/change-task-title';
import { ChangeTaskType } from '@/features/change-task-type';
import { DeleteTaskButton } from '@/features/delete-task';
import { getTaskDetailsRoute, ROUTES } from '@/shared/config';
import { useDocumentTitle } from '@/shared/lib';
import { ErrorState } from '@/shared/ui';
import { TaskComments } from '@/widgets/task-comments';
import { Box, Center, Divider, Grid, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';
import styles from './TaskDetailsPage.module.css';

export const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const {
    tasksByColumnId,
    isLoading: isTasksLoading,
    isLoaded: isTasksLoaded,
  } = useTaskStore(useShallow(selectTasks));

  const task = useMemo(() => {
    if (!taskId) return undefined;

    return Object.values(tasksByColumnId)
      .flatMap((columnTasks) => columnTasks ?? [])
      .find((task) => task.id === taskId);
  }, [taskId, tasksByColumnId]);

  const isInitialLoading = isTasksLoading && !isTasksLoaded;
  const pageTitle = isInitialLoading ? 'Загрузка задачи' : (task?.title ?? 'Задача не найдена');

  useDocumentTitle(pageTitle);

  if (isInitialLoading) {
    return (
      <Center h={240}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!task) {
    return (
      <ErrorState
        title="Задача не найдена"
        description="Возможно, задача была удалена или указан неверный идентификатор"
      />
    );
  }

  const createdAt = taskDateFormatter.format(new Date(task.createdAt));

  return (
    <Stack className={styles.page} gap="md">
      <Paper
        bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
        p={{ base: 'md', sm: 'lg', md: 'xl' }}
        radius="lg"
        shadow="none"
        withBorder
      >
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

          <Grid gap="xl">
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }} pos="relative">
              <Box
                bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                className={styles.metaPanel}
                p="md"
                h="fit-content"
                pos="sticky"
                top="calc(64px + var(--mantine-spacing-md))"
              >
                <Stack gap="md">
                  <Text
                    c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
                    component="h2"
                    fw={700}
                    m={0}
                    size="sm"
                  >
                    Сведения
                  </Text>

                  <Box className={styles.fields}>
                    <Box className={styles.field}>
                      <Text
                        c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
                        fw={650}
                        size="sm"
                      >
                        Статус:
                      </Text>
                      <ChangeTaskStatusSelect task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text
                        c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
                        fw={650}
                        size="sm"
                      >
                        Приоритет:
                      </Text>
                      <ChangeTaskPrioritySelect task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text
                        c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
                        fw={650}
                        size="sm"
                      >
                        Тип:
                      </Text>
                      <ChangeTaskType task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text
                        c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
                        fw={650}
                        size="sm"
                      >
                        Тег:
                      </Text>
                      <ChangeTaskTag task={task} />
                    </Box>

                    <Box className={styles.field}>
                      <Text
                        c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-2))"
                        fw={650}
                        size="sm"
                      >
                        Создано:
                      </Text>
                      <Text
                        c="light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-1))"
                        fw={500}
                        size="sm"
                      >
                        {createdAt}
                      </Text>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
              <Stack className={styles.section} component="section" gap="xs">
                <Text
                  c="light-dark(var(--mantine-color-gray-9), var(--mantine-color-dark-0))"
                  component="h2"
                  fw={700}
                  m={0}
                  size="sm"
                >
                  Описание
                </Text>

                <ChangeTaskDescriptionInline task={task} />
              </Stack>
            </Grid.Col>
          </Grid>

          <Divider color="light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))" />

          <TaskComments taskId={task.id} />
        </Stack>
      </Paper>
    </Stack>
  );
};
