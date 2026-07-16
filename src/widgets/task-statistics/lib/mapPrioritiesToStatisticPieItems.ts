import {
  TASK_PRIORITIES,
  TASK_PRIORITY_COLOR,
  TASK_PRIORITY_TITLE,
  type Task,
} from '@/entities/task'
import type { StatisticPieItem } from '@/shared/ui'
import type { MantineTheme } from '@mantine/core'
import { getThemeChartColor } from './getThemeChartColor'

export const mapPrioritiesToStatisticPieItems = (
  tasks: Task[],
  theme: MantineTheme,
): StatisticPieItem[] => {
  return TASK_PRIORITIES.map((priority) => {
    const taskPriority = priority

    return {
      id: taskPriority,
      label: TASK_PRIORITY_TITLE[taskPriority],
      count: tasks.filter((task) => task.priority === taskPriority).length,
      color: getThemeChartColor(theme, TASK_PRIORITY_COLOR[taskPriority]),
    }
  })
}
