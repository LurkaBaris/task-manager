import type { ChartOptions } from 'chart.js'

export const getChartOptions = (textColor: string, gridColor: string): ChartOptions<'bar'> => ({
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
          const value = Number(context.parsed.x)

          return `${label}: ${value}`
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        color: textColor,
        precision: 0,
        stepSize: 1,
      },
      grid: {
        color: gridColor,
      },
    },
    y: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: false,
        color: textColor,
      },
    },
  },
})
