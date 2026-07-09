export interface StatisticStackedBarDataset {
  id: string
  label: string
  color: string
  values: number[]
}

export interface StatisticStackedBarData {
  labels: string[]
  datasets: StatisticStackedBarDataset[]
}
