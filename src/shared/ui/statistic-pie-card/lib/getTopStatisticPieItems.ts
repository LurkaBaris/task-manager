import type { StatisticPieItem } from '../model/types';

const MAX_VISIBLE_ITEMS = 5;

export const getTopStatisticPieItems = (items: StatisticPieItem[]): StatisticPieItem[] => {
  return items
    .filter((item) => item.count > 0)
    .sort((firstItem, secondItem) => secondItem.count - firstItem.count)
    .slice(0, MAX_VISIBLE_ITEMS);
};
