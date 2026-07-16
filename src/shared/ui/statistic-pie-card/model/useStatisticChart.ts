import type { Chart } from 'chart.js'
import { useMemo, useRef } from 'react'
import { getTopStatisticPieItems } from '../lib/getTopStatisticPieItems'
import { mapStatisticItemsToPieChartData } from '../lib/mapStatisticItemsToPieChartData'
import type { StatisticPieItem } from './types'

type StatisticChartType = 'pie' | 'doughnut'

export const useStatisticChart = <T extends StatisticChartType>(items: StatisticPieItem[]) => {
  const chartRef = useRef<Chart<T>>(null)
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const visibleItems = useMemo(() => {
    return getTopStatisticPieItems(items)
  }, [items])
  const visibleTotal = visibleItems.reduce((sum, item) => sum + item.count, 0)
  const chartData = useMemo(() => {
    return mapStatisticItemsToPieChartData(visibleItems)
  }, [visibleItems])

  const setActiveChartItem = (itemIndex: number | null) => {
    const chart = chartRef.current

    if (!chart) {
      return
    }

    const activeElements =
      itemIndex === null
        ? []
        : [
            {
              datasetIndex: 0,
              index: itemIndex,
            },
          ]

    chart.setActiveElements(activeElements)
    chart.tooltip?.setActiveElements(
      activeElements,
      itemIndex === null
        ? { x: 0, y: 0 }
        : {
            x: chart.chartArea.left + chart.chartArea.width / 2,
            y: chart.chartArea.top + chart.chartArea.height / 2,
          },
    )
    chart.update()
  }

  const handleLegendItemMouseEnter = (item: StatisticPieItem) => {
    const itemIndex = visibleItems.findIndex((visibleItem) => visibleItem.id === item.id)

    if (itemIndex !== -1) {
      setActiveChartItem(itemIndex)
    }
  }

  const handleLegendItemMouseLeave = () => {
    setActiveChartItem(null)
  }

  return {
    chartData,
    chartRef,
    handleLegendItemMouseEnter,
    handleLegendItemMouseLeave,
    total,
    visibleItems,
    visibleTotal,
  }
}
