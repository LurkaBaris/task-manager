import { Pie } from 'react-chartjs-2';
import { pieChartOptions } from '../model/chartOptions';
import type { StatisticPieItem } from '../model/types';
import { useStatisticChart } from '../model/useStatisticChart';
import { StatisticChartCard } from './StatisticChartCard';

interface StatisticPieCardProps {
  title: string;
  description: string;
  items: StatisticPieItem[];
}

export const StatisticPieCard = ({ title, description, items }: StatisticPieCardProps) => {
  const {
    chartData,
    chartRef,
    handleLegendItemMouseEnter,
    handleLegendItemMouseLeave,
    total,
    visibleItems,
    visibleTotal,
  } = useStatisticChart<'pie'>(items);

  return (
    <StatisticChartCard
      description={description}
      title={title}
      total={total}
      visibleItems={visibleItems}
      visibleTotal={visibleTotal}
      onLegendItemMouseEnter={handleLegendItemMouseEnter}
      onLegendItemMouseLeave={handleLegendItemMouseLeave}
    >
      <Pie ref={chartRef} data={chartData} options={pieChartOptions} />
    </StatisticChartCard>
  );
};
