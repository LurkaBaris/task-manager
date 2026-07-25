import { type ChartOptions } from 'chart.js';

interface TooltipLabelContext {
  raw: unknown;
  label: string;
  dataset: {
    data: number[];
  };
}

const getPercent = (value: number, total: number): number => {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
};

const getTooltipLabel = (context: TooltipLabelContext): string => {
  const value = Number(context.raw);
  const values = context.dataset.data;
  const total = values.reduce((sum, item) => sum + item, 0);
  const percent = getPercent(value, total);

  return `${context.label}: ${value} (${percent}%)`;
};

const config = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      padding: 10,
      callbacks: {
        label: getTooltipLabel,
      },
    },
  },

  layout: {
    padding: 6,
  },
};

export const pieChartOptions: ChartOptions<'pie'> = {
  ...config,
};

export const doughnutChartOptions: ChartOptions<'doughnut'> = {
  cutout: '68%',
  ...config,
};
