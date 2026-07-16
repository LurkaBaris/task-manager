import {
  STATISTIC_PIE_CHART_BORDER_WIDTH,
  STATISTIC_PIE_CHART_HOVER_OFFSET,
} from '../model/constants'
import type { StatisticPieItem } from '../model/types'

export const mapStatisticItemsToPieChartData = (items: StatisticPieItem[], borderColor: string) => {
  return {
    labels: items.map((item) => item.label),
    datasets: [
      {
        data: items.map((item) => item.count),
        backgroundColor: items.map((item) => item.color),
        borderColor,
        borderWidth: STATISTIC_PIE_CHART_BORDER_WIDTH,
        hoverOffset: STATISTIC_PIE_CHART_HOVER_OFFSET,
      },
    ],
  }
}
