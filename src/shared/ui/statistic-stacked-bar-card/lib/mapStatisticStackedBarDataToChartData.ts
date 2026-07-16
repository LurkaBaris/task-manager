import type { ChartData } from 'chart.js'
import {
  STATISTIC_STACKED_BAR_BORDER_COLOR,
  STATISTIC_STACKED_BAR_BORDER_RADIUS,
  STATISTIC_STACKED_BAR_BORDER_WIDTH,
  STATISTIC_STACKED_BAR_MAX_BAR_THICKNESS,
} from '../model/constants'
import type { StatisticStackedBarData } from '../model/types'

export const mapStatisticStackedBarDataToChartData = (
  data: StatisticStackedBarData,
): ChartData<'bar', number[], string> => {
  return {
    labels: data.labels,
    datasets: data.datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.values,
      backgroundColor: dataset.color,
      borderColor: STATISTIC_STACKED_BAR_BORDER_COLOR,
      borderRadius: STATISTIC_STACKED_BAR_BORDER_RADIUS,
      borderWidth: STATISTIC_STACKED_BAR_BORDER_WIDTH,
      maxBarThickness: STATISTIC_STACKED_BAR_MAX_BAR_THICKNESS,
      borderSkipped: false,
    })),
  }
}
