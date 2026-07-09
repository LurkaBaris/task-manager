import type { ChartOptions } from 'chart.js'

const getPercent = (value: number, total: number): number => {
  if (total === 0) {
    return 0
  }

  return Math.round((value / total) * 100)
}

export const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = Number(context.raw)
          const values = context.dataset.data
          const total = values.reduce((sum, item) => sum + item, 0)
          const percent = getPercent(value, total)

          return `${context.label}: ${value} (${percent}%)`
        },
      },
    },
  },
}
