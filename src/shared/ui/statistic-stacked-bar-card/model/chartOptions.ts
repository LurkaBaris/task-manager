import type { ChartOptions } from 'chart.js'

export const chartOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label ?? 'Значение'
          const value = Number(context.parsed.y)

          return `${label}: ${value}`
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        maxRotation: 0,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        precision: 0,
        stepSize: 1,
      },
    },
  },
}
