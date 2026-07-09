import type { ChartData } from 'chart.js'
import {
  STATISTIC_PIE_CHART_BORDER_COLOR,
  STATISTIC_PIE_CHART_BORDER_WIDTH,
  STATISTIC_PIE_CHART_HOVER_OFFSET,
} from '../model/constants'
import type { StatisticPieItem } from '../model/types'

export const mapStatisticItemsToPieChartData = (
  items: StatisticPieItem[],
): ChartData<'pie', number[], string> => {
  const visibleItems = items.filter((item) => item.count > 0)

  return {
    labels: visibleItems.map((item) => item.label),
    datasets: [
      {
        data: visibleItems.map((item) => item.count),
        backgroundColor: visibleItems.map((item) => item.color),
        borderColor: STATISTIC_PIE_CHART_BORDER_COLOR,
        borderWidth: STATISTIC_PIE_CHART_BORDER_WIDTH,
        hoverOffset: STATISTIC_PIE_CHART_HOVER_OFFSET,
      },
    ],
  }
}
