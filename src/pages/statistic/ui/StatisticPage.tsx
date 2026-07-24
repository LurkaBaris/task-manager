import { useDocumentTitle } from '@/shared/lib';
import { TaskStatistics } from '@/widgets/task-statistics';
import { Stack } from '@mantine/core';

export const StatisticPage = () => {
  useDocumentTitle('Статистика');

  return (
    <Stack component="section" gap="lg" mih="100%" flex={1}>
      <TaskStatistics />
    </Stack>
  );
};
