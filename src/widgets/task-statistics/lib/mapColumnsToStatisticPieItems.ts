import type { Column } from '@/entities/column';
import type { TasksByColumnId } from '@/entities/task';
import type { StatisticPieItem } from '@/shared/ui';
import type { MantineTheme } from '@mantine/core';
import { getThemeChartColor } from './getThemeChartColor';

export const mapColumnsToStatisticPieItems = (
  columns: Column[],
  tasksByColumnId: TasksByColumnId,
  theme: MantineTheme,
): StatisticPieItem[] => {
  return columns.map((column) => ({
    id: column.id,
    label: column.title,
    count: tasksByColumnId[column.id]?.length ?? 0,
    color: getThemeChartColor(theme, column.color),
  }));
};
