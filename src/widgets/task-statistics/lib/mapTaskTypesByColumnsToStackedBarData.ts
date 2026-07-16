import type { Column } from '@/entities/column'
import { TASK_TYPE_CONFIG, type TasksByColumnId } from '@/entities/task'
import { type StatisticStackedBarData } from '@/shared/ui'
import type { MantineTheme } from '@mantine/core'
import { getThemeChartColor } from './getThemeChartColor'

export const mapTaskTypesByColumnsToStackedBarData = (
  columns: Column[],
  tasksByColumnId: TasksByColumnId,
  theme: MantineTheme,
): StatisticStackedBarData => ({
  labels: columns.map((column) => column.title),
  datasets: TASK_TYPE_CONFIG.map((taskType) => ({
    id: taskType.id,
    label: taskType.title,
    color: getThemeChartColor(theme, taskType.color),
    values: columns.map((column) => {
      const tasks = tasksByColumnId[column.id] ?? []

      return tasks.filter((task) => task.type === taskType.id).length
    }),
  })),
})
